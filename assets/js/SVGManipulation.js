const DefaultNameSpaceURI = `http://www.w3.org/2000/svg`;


let ADDING_ELEMENT_MODE = false;

let LAST_ADDED_POINT = {
    x: null,
    y: null
}

let ADDING_POINTS = []

let PLACING_CURRENT_AREA_ID = null;

function CreateBlankSVG(){
    return `<svg width="100%" height="100%" id="SVGImage" xmlns="${DefaultNameSpaceURI}" data-export="true"></svg>`;
}

function InitiateSVGTool(image){
    let _blankSvg = CreateBlankSVG();

    $("#SVGContainer").html(_blankSvg);

    $("#ContainerPlaceHolderImage").hide();
    $("#SVGContainer").show();

    ImageToSvg(image);
    SetSVGViewBox();
}

function SetSVGViewBox(){
    let svgElement = $("#SVGImage")[0];

    let width = svgElement.width.baseVal.value;
    let height = svgElement.height.baseVal.value;

    svgElement.setAttribute("viewbox", `0 0 ${width} ${height}`);
}

function ImageToSvg(imageContent){
    let imageElement = document.createElementNS(DefaultNameSpaceURI, "image");

    imageElement.setAttribute("href", imageContent);
    imageElement.setAttribute("width", "100%");
    imageElement.setAttribute("height", "100%");
    imageElement.setAttribute("data-export", "true");

    document.querySelector("#SVGImage").appendChild(imageElement);

    document.querySelector("#SVGImage").addEventListener("click", HandleSvgClick);
}

function HandleSvgClick(event){
    let closestCircle = $(event.target).closest("circle");

    if (event.target.tagName.toLowerCase() == "circle"){
        closestCircle = $(event.target);
    }

    if (event.target.tagName.toLowerCase() == "line"){
        return;
    }

    if (closestCircle.length > 0){
        if (ADDING_ELEMENT_MODE === true){
            let x = closestCircle.attr("cx");
            let y = closestCircle.attr("cy");
    
            AddSVGLine(LAST_ADDED_POINT.x, LAST_ADDED_POINT.y, x, y);
            OnEndPlacingPoints();
        }
    } else {
        if (ADDING_ELEMENT_MODE === false){
            return;
        }

        GetSvgClickingPoint(event);
    }
}

function GetSvgClickingPoint(event){
    var targetElement = event.target;
    var dimensions = targetElement.getBoundingClientRect();
    var x = event.clientX - dimensions.left;
    var y = event.clientY - dimensions.top;

    AddSVGCircle(x, y);
}

function AddSVGCircle(x, y){
    let element = document.createElementNS(DefaultNameSpaceURI, "circle");

    element.setAttribute("r", "8");
    element.setAttribute("cx", x);
    element.setAttribute("cy", y);
    element.setAttribute("fill", "#ffc107");
    element.setAttribute("placing-polygon-temp", true);

    document.querySelector("#SVGImage").appendChild(element);

    if (LAST_ADDED_POINT.x !== null && LAST_ADDED_POINT.y !== null){
        AddSVGLine(LAST_ADDED_POINT.x, LAST_ADDED_POINT.y, x, y);
    }

    LAST_ADDED_POINT.x = x;
    LAST_ADDED_POINT.y = y;

    ADDING_POINTS.push({
        "x": x,
        "y": y
    });
}

function AddSVGLine(startX, startY, endX, endY){
    let element = document.createElementNS(DefaultNameSpaceURI, "line");

    element.setAttribute("x1", startX);
    element.setAttribute("y1", startY);
    element.setAttribute("x2", endX);
    element.setAttribute("y2", endY);
    element.setAttribute("placing-polygon-temp", true);

    element.setAttribute("style", "stroke:#ffc107;stroke-width:2");

    document.querySelector("#SVGImage").appendChild(element);
}

function AddSVGPolygon(title, points){
    let element = document.createElementNS(DefaultNameSpaceURI, "polygon");

    let pointsString = "";

    if (!Array.isArray(points)){
        return;
    }

    if (points.length <= 0){
        return;
    }

    points.forEach(point =>{
        pointsString += `${point.x},${point.y} `;
    })

    let polygonId = String(title).replaceAll(" ", "_");

    element.setAttribute("title", title);
    element.setAttribute("id", polygonId);
    element.setAttribute("points", pointsString);
    element.setAttribute("fill", "#ffc10785");
    element.setAttribute("data-area-id", PLACING_CURRENT_AREA_ID);
    element.setAttribute("data-export", "true"); 

    document.querySelector("#SVGImage").appendChild(element);

    AddSVGPolygonText(polygonId, title);

    UpdateElementPoints(PLACING_CURRENT_AREA_ID, points);
}

function AddSVGPolygonText(polygonId, name){
    let _polygonCentre = GetPolygonCentre(polygonId);

    if (_polygonCentre === false){
        return false;
    }

    let element = document.createElementNS(DefaultNameSpaceURI, "text");

    element.setAttribute("x", _polygonCentre.x);
    element.setAttribute("y", _polygonCentre.y);
    element.setAttribute("fill", "black");
    element.setAttribute("data-area-id", PLACING_CURRENT_AREA_ID);
    element.setAttribute("data-export", false);
    element.innerHTML = name;

    document.querySelector("#SVGImage").appendChild(element);
}


function GetPolygonCentre(polygonId){
    let _polygon = $(`#${polygonId}`);

    if (_polygon.length == 0){
        return false;
    }

    let points = _polygon[0].points;

    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = 0;
    let maxY = 0;


    for(let i = 0; i < points.length; i++){
        let element = points[i];

        if (element.x > maxX){
            maxX = element.x;
        }

        if (element.y > maxY){
            maxY = element.y;
        }

        if (element.x < minX){
            minX = element.x;
        }

        if (element.y < minY){
            minY = element.y;
        }
    }

    return {
        x: minX + ((maxX - minX) / 2),
        y: minY + ((maxY - minY) / 2)
    }
}


function ResetPlacingPointsMode(){
    LAST_ADDED_POINT.x = null;
    LAST_ADDED_POINT.y = null;

    ADDING_POINTS = [];
    ADDING_ELEMENT_MODE = false;
}

function OnEnterPlacingPoints(){
    ResetPlacingPointsMode();

    ADDING_ELEMENT_MODE = true;
}

function OnEndPlacingPoints(){
    $("[placing-polygon-temp='true']").remove();

    let selectedArea = SVG_AREAS.filter((area)=>{ return area.ID == PLACING_CURRENT_AREA_ID})[0];

    AddSVGPolygon(selectedArea.Name, ADDING_POINTS);

    ResetPlacingPointsMode();

    $(`button[data-id='${PLACING_CURRENT_AREA_ID}']`).attr("disabled", false);

    PLACING_CURRENT_AREA_ID = null;
}