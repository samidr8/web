// Configuración de marcadores y sus contenidos
const markers = [
    {
        id: "video-marker",
        url: "https://samidr8.github.io/web/markers/nun1",
        type: "video",
        content: {
            url: "https://www.youtube.com/watch?v=dayfz0ff1Mc",
            title: "Video de YouTube",
        }
    },
    {
        id: "geogebra-marker",
        url: "https://samidr8.github.io/web/markers/nun2",
        type: "iframe",
        content: {
            url: "https://www.geogebra.org/material/iframe/id/qzjfkvpm/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/true/rc/false/ld/false/sdz/false/ctl/false",
            title: "Applet GeoGebra"
        }
    },
    {
        id: "formulario-marker",
        url: "https://samidr8.github.io/web/markers/nun3",
        type: "iframe",
        content: {
            url: "https://wordwall.net/es/resource/12994896/n%C3%BAmeros-negativos-y-positivos",
            title: "Quiz",
            fallbackEnabled: true
        }
    },
    {
        id: "volcan-marker",
        url: "https://samidr8.github.io/web/markers/dinosaurio",
        type: "3d-model",
        content: {
            url: "https://samidr8.github.io/web/media/volcano.glb",
            scale: "300 300 300",
            position: "150 0 -150",
            rotation: "0 0 0",
            title: "Modelo 3D de Volcán",
            interactive: true,
            infoTitle: "Volcán",
            infoContent: "• Los volcanes son aberturas en la corteza terrestre\n• Liberan magma, ceniza y gases del interior\n• Pueden formar montañas cónicas\n• Hay más de 1,500 volcanes activos en la Tierra",
            infoImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Erupcion_del_volcan_de_Pacaya.JPG/220px-Erupcion_del_volcan_de_Pacaya.JPG"
        }
    },
    {
        id: "tierra-marker",
        url: "https://samidr8.github.io/web/markers/tierra",
        type: "3d-model",
        content: {
            url: "https://samidr8.github.io/web/media/tierra.glb",
            scale: "1500 1500 1500",
            position: "150 0 -150",
            rotation: "0 180 0",
            title: "Modelo 3D de la Tierra",
            interactive: true,
            infoTitle: "La Tierra",
            infoContent: "• Diámetro: 12,742 km\n• Distancia al Sol: 149.6 millones km\n• Edad: 4.54 mil millones de años\n• Período de rotación: 23.93 horas\n• Período orbital: 365.25 días",
            infoImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/240px-The_Blue_Marble_%28remastered%29.jpg"
        }
    },
    {
        id: "video-marker",
        url: "https://samidr8.github.io/web/markers/zenon",
        type: "video",
        content: {
            url: "https://www.youtube.com/watch?v=7B0Z_JaEGlU",
            title: "Video de YouTube"
        }
    },
    {
        id: "formulario-marker",
        url: "https://samidr8.github.io/web/markers/formulario",
        type: "iframe",
        content: {
            url: "https://www.mep.go.cr/",
            title: "Página MEP",
            fallbackEnabled: true
        }
    },
    {
        id: "geogebra-marker",
        url: "https://samidr8.github.io/web/markers/geogebra",
        type: "iframe",
        content: {
            url: "https://www.geogebra.org/material/iframe/id/DCDmYQ8z/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/true/rc/false/ld/false/sdz/false/ctl/false",
            title: "Applet de GeoGebra"
        }
    }
];