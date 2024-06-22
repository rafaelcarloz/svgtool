const DefaultImageUrl = "assets/images/image-default-placeholder.webp";

let SVG_AREAS = []
let SVG_AREA_CURRENT_ID = 0;

$("#ImagePlaceHolder").click(function(){
    $("#FileSelectorImage").click();
});

$("#FileSelectorImage").change(function(){
    LoadImageFile();
});

$("#BtnAddElement").click(function(){
    $("#TempElement").show();
    $("#BtnAddElement").hide();
});

$("#InputTempName").on("input",function(){
    this.classList.remove("is-invalid");
})

$("#BtnSaveTempElement").click(function(){
    let areaName = $("#InputTempName").val();

    if (areaName == ""){
        return $("#InputTempName")[0].classList.add("is-invalid");
    }

    $("#InputTempName").val("");

    $("#TempElement").hide();
    $("#BtnAddElement").show();

    let svgArea = CreateSVGAreaItem(areaName);

    if (SVG_AREAS.length == 0){
        $("#ElementsContainer").html("");
    }

    SVG_AREAS.push(svgArea);
    CreateSVGListElement(svgArea);
});

function LoadImageFile() {
    var file    = document.querySelector('#FileSelectorImage').files[0];
    var reader  = new FileReader();
  
    reader.onloadend = function () {
        InitiateSVGTool(reader.result);
        $("button").attr("disabled", false);
    }
  
    if (file) {
      reader.readAsDataURL(file);
    }
}

function CreateSVGAreaItem(name){
    SVG_AREA_CURRENT_ID += 1;

    return {
        ID: SVG_AREA_CURRENT_ID,
        Name: name,
        Points: [],
    }
}

function CreateSVGListElement(area){
    let HTMLListElement = 
        `<div class="row m-0 p-1 my-1 border rounded shadow-sm element-item" data-id="${area.ID}">
            <div class="row m-0 px-0">
                <div class="d-inline px-0"> 
                    <div class="float-start text-muted px-0">
                        <i class="bi bi-geo-fill"></i>
                        <small class='text-medium'>${area.Name}</small>
                    </div>
                    
                    <div class="float-end">
                        <button type="button" class="btn py-0" data-id="${area.ID}" onclick="EnterPinPointsMode(this);">
                            <i class="bi bi-crosshair2 text-primary"></i>
                        </button>
                        <button type="button" class="btn py-0" data-id="${area.ID}" onclick="DeleteElementItem(this);">
                            <i class="bi bi-trash3-fill text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="row m-0 p-0">
                <span class='text-very-small text-success points-element' data-id="${area.ID}"></span>
            </div>
        </div>`;

    $("#ElementsContainer").append(HTMLListElement);
}

function UpdateElementPoints(id, points){
    for(let i = 0; i < SVG_AREAS.length; i++){
        if (SVG_AREAS[i].ID == id){
            SVG_AREAS[i].Points = points;

            let pointsString = "";

            points.forEach(point =>{
                pointsString += `${parseFloat(point.x).toFixed(1)},${parseFloat(point.y).toFixed(1)} `;
            })

            pointsString = `{${pointsString}}`;

            $(`.points-element[data-id='${id}']`).html(pointsString);

            break;
        }
    }
}

function EnterPinPointsMode(element){
    let _areaId = element.getAttribute("data-id");

    PLACING_CURRENT_AREA_ID = _areaId;

    $(`button[data-id='${_areaId}']`).attr("disabled", true);
    $(`polygon[data-area-id='${_areaId}']`).remove();
    $(`text[data-area-id='${_areaId}']`).remove();

    OnEnterPlacingPoints();
}

function DeleteElementItem(element){
    let _areaId = element.getAttribute("data-id");

    if (confirm("Deseja realmente excluir a area?")){
        $(`.element-item[data-id='${_areaId}']`).remove(); 
        $(`polygon[data-area-id='${_areaId}']`).remove();
        $(`text[data-area-id='${_areaId}']`).remove();
    }
}

$("#BtnExportSVG").click(function(){
    let SVGContent = String($("#SVGContainer").html()).replace(`id="SVGImage"`, `id="SVGExportImage"`);

    $("#SVGExportContainer").html(SVGContent);
    let removeElements = $("#SVGExportContainer")[0].querySelectorAll("[data-export='false']");

    for (element in removeElements) {
        parent = removeElements[element].parentNode;

        if (!parent){
            continue;
        }

        parent.removeChild(removeElements[element]);
    }

    download(String($("#SVGExportContainer").html()), "SVG_Tool_export.svg", "image/svg+xml");
});


function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}