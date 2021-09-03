//API documentation on pqlina.nl/filepond/docs/api
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode
)

FilePond.setOptions({
    stylePanelAspectRation: 100/100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight:  100,
    imageResizeUpscale: false //Prevent upscaling of images smaller than target

})

FilePond.parse(document.body);