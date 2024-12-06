const photoFolders = [
  {
    id: 1,
    title: "eraMileiTitulo",
    location: "Buenos Aires, Argentina (2023-2024)",
    cover: "./assets/La Era Milei/1-20231210182626_IMG_0828.jpg",
    photos: [
      {
        id: 1100,
        url: "",
        title: "La era Milei",
        description: "eraMileiTexto",
      },
      {
        id: 1101,
        url: "./assets/La era Milei/1-20231210182626_IMG_0828.jpg",
        title: "La era Milei",
        description: "20231210182626_IMG_0828",
      },
      {
        id: 1102,
        url: "./assets/La era Milei/2-20231210164355_IMG_0750.jpg",
        title: "La era Milei",
        description: "20231210164355_IMG_0750",
      },
      {
        id: 1103,
        url: "./assets/La era Milei/3-20231210163638_IMG_0735.jpg",
        title: "La era Milei",
        description: "20231210163638_IMG_0735",
      },
      {
        id: 1104,
        url: "./assets/La era Milei/4-IMG_0766.jpg",
        title: "La era Milei",
        description: "IMG_0766",
      },
      {
        id: 1105,
        url: "./assets/La era Milei/5-20240201003106_IMG_3329.jpg",
        title: "La era Milei",
        description: "20240201003106_IMG_3329",
      },
      {
        id: 1106,
        url: "./assets/La era Milei/6-20240202002754_IMG_3554.jpg",
        title: "La era Milei",
        description: "20240202002754_IMG_3554",
      },
      {
        id: 1107,
        url: "./assets/La era Milei/7-20240423225418_IMG_6902.jpg",
        title: "La era Milei",
        description: "20240423225418_IMG_6902",
      },
      {
        id: 1108,
        url: "./assets/La era Milei/8-20240201004731_IMG_3378.jpg",
        title: "La era Milei",
        description: "20240201004731_IMG_3378",
      },
      {
        id: 1109,
        url: "./assets/La era Milei/9-20240202001932_IMG_3523.jpg",
        title: "La era Milei",
        description: "20240202001932_IMG_3523",
      },
      {
        id: 1110,
        url: "./assets/La era Milei/10-20240509155920_IMG_8121.jpg",
        title: "La era Milei",
        description: "20240509155920_IMG_8121",
      },
      {
        id: 1111,
        url: "./assets/La era Milei/11-20240509161104_IMG_8146.jpg",
        title: "La era Milei",
        description: "20240509161104_IMG_8146",
      },
      {
        id: 1112,
        url: "./assets/La era Milei/12-20240124185231_IMG_2773.jpg",
        title: "La era Milei",
        description: "20240124185231_IMG_2773",
      },
      {
        id: 1113,
        url: "./assets/La era Milei/13-20240523033719_IMG_8807.jpg",
        title: "La era Milei",
        description: "20240523033719_IMG_8807",
      },
      {
        id: 1114,
        url: "./assets/La era Milei/14-20240523023229_IMG_8526.jpg",
        title: "La era Milei",
        description: "20240523023229_IMG_8526",
      },
      {
        id: 1115,
        url: "./assets/La era Milei/15-20240807191749_IMG_1332 (1).jpg",
        title: "La era Milei",
        description: "20240807191749_IMG_1332",
      },
      {
        id: 1116,
        url: "./assets/La era Milei/16-Cristian Pirovano_Ley Bases II.jpg",
        title: "La era Milei",
        description: "Cristian Pirovano_Ley Bases II",
      },
      {
        id: 1117,
        url: "./assets/La era Milei/17-IMG_0483.jpg",
        title: "La era Milei",
        description: "IMG_0483",
      },
      {
        id: 1118,
        url: "./assets/La era Milei/18-Cristian Pirovano_Ley Bases I_.jpg",
        title: "La era Milei",
        description: "Cristian Pirovano_Ley Bases I",
      },
      {
        id: 1119,
        url: "./assets/La era Milei/19-1727736511720.jpg",
        title: "La era Milei",
        description: "1727736511720",
      },
      {
        id: 1120,
        url: "./assets/La era Milei/20-1727736488261.jpg",
        title: "La era Milei",
        description: "1727736488261",
      },
      {
        id: 1121,
        url: "./assets/La era Milei/21-1727736511735.jpg",
        title: "La era Milei",
        description: "1727736511735",
      },
      {
        id: 1122,
        url: "./assets/La era Milei/22-1727736635216.jpg",
        title: "La era Milei",
        description: "1727736635216",
      },
      {
        id: 1123,
        url: "./assets/La era Milei/23-1727736972516.jpg",
        title: "La era Milei",
        description: "1727736972516",
      },
      {
        id: 1124,
        url: "./assets/La era Milei/24-1727736635184.jpg",
        title: "La era Milei",
        description: "1727736635184",
      },
      {
        id: 1125,
        url: "./assets/La era Milei/25-1727736682981.jpg",
        title: "La era Milei",
        description: "1727736682981",
      },
      {
        id: 1126,
        url: "./assets/La era Milei/26-1727736607429.jpg",
        title: "La era Milei",
        description: "1727736607429",
      },
      {
        id: 1127,
        url: "./assets/La era Milei/27-1727736463478.jpg",
        title: "La era Milei",
        description: "1727736463478",
      },
      {
        id: 1128,
        url: "./assets/La era Milei/28-1727736463464.jpg",
        title: "La era Milei",
        description: "1727736463464",
      },
      {
        id: 1129,
        url: "./assets/La era Milei/29-1727736534209.jpg",
        title: "La era Milei",
        description: "1727736534209",
      },
      {
        id: 1130,
        url: "./assets/La era Milei/30-1727736635201.jpg",
        title: "La era Milei",
        description: "1727736635201",
      },
      {
        id: 1131,
        url: "./assets/La era Milei/31-1727736488229.jpg",
        title: "La era Milei",
        description: "1727736488229",
      },
      {
        id: 1132,
        url: "./assets/La era Milei/32-1727736682966.jpg",
        title: "La era Milei",
        description: "1727736682966",
      },
    ],
  },
  {
    id: 2,
    title: "yerbaMateTitulo",
    location: "Misiones, Argentina (2024)",
    cover: "./assets/Yerba Mate/1-IMG_9571.jpg",
    photos: [
      {
        id: 601,
        url: "./assets/Yerba Mate/1-IMG_9571.jpg",
        title: "Yerba Mate",
        description: "IMG_9571",
      },
      {
        id: 602,
        url: "./assets/Yerba Mate/2-IMG_9471.jpg",
        title: "Yerba Mate",
        description: "IMG_9477",
      },
      {
        id: 603,
        url: "./assets/Yerba Mate/3-IMG_9711.jpg",
        title: "Yerba Mate",
        description: "IMG_9711",
      },
      {
        id: 604,
        url: "./assets/Yerba Mate/4-IMG_9467.jpg",
        title: "Yerba Mate",
        description: "IMG_9467",
      },
      {
        id: 605,
        url: "./assets/Yerba Mate/5-IMG_9626.jpg",
        title: "Yerba Mate",
        description: "IMG_9626",
      },
      {
        id: 606,
        url: "./assets/Yerba Mate/6-IMG_9719.jpg",
        title: "Yerba Mate",
        description: "IMG_9719",
      },
      {
        id: 607,
        url: "./assets/Yerba Mate/7-IMG_9501.jpg",
        title: "Yerba Mate",
        description: "IMG_9501",
      },
      {
        id: 608,
        url: "./assets/Yerba Mate/8-IMG_9755 (1).jpg",
        title: "Yerba Mate",
        description: "IMG_9755",
      },
      {
        id: 609,
        url: "./assets/Yerba Mate/9-IMG_9775 (1).jpg",
        title: "Yerba Mate",
        description: "IMG_9775",
      },
      {
        id: 610,
        url: "./assets/Yerba Mate/10-IMG_9984.jpg",
        title: "Yerba Mate",
        description: "IMG_9994",
      },
    ],
  },
  {
    id: 3,
    title: "eleccionesArgentina2023Titulo",
    location: "Buenos Aires, Argentina (2023)",
    cover:
      "./assets/Elecciones Presidenciales 2023-Ballotaje/Bunker Javier Milei III. Cristian Pirovano.jpg",
    photos: [
      {
        id: 1001,
        url: "./assets/Elecciones Presidenciales 2023-Ballotaje/Bunker Javier Milei III. Cristian Pirovano.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei III",
      },
      {
        id: 1002,
        url: "./assets/Elecciones Presidenciales 2023-Ballotaje/Bunker Javier Milei IV. Cristian Pirovano.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei IV",
      },
      {
        id: 1003,
        url: "./assets/Elecciones Presidenciales 2023-Ballotaje/Bunker Javier Milei. Cristian Pirovano.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei",
      },
      {
        id: 1004,
        url: "./assets/Elecciones Presidenciales 2023-Ballotaje/Bunker Sergio Massa II. Cristian Pirovano.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Sergio Massa II",
      },
      {
        id: 1005,
        url: "./assets/Elecciones Presidenciales 2023-Ballotaje/Entrada de colegio Carlos Pellegrini II. Cristian Pirovano.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Entrada de colegio Carlos Pellegrini II",
      },
    ],
  },
  {
    id: 4,
    title: "vidaBajoOcupacionTitulo",
    location: "Palestina (2013-2022)",
    cover: "./assets/Palestina/Life under occupation/1-IMG_3509-3-30x45.jpg",
    photos: [
      {
        id: 200,
        url: "",
        title: "Introduction",
        description: "vidaBajoOcupacionTexto",
      },
      {
        id: 201,
        url: "./assets/Palestina/Life under occupation/1-IMG_3509-3-30x45.jpg",
        title: "Life under occupation",
        description: "IMG_3509-3-30x45",
      },
      {
        id: 202,
        url: "./assets/Palestina/Life under occupation/2-IMG_8366.jpg",
        title: "",
        description: "IMG_8366",
      },
      {
        id: 203,
        url: "./assets/Palestina/Life under occupation/3-IMG_3197 30x45.jpg",
        title: "Life under occupation",
        description: "IMG_3197 30x45",
      },
      {
        id: 204,
        url: "./assets/Palestina/Life under occupation/4-976-45x30 (2).jpg",
        title: "",
        description: "976-45x30 (2)",
      },
      {
        id: 205,
        url: "./assets/Palestina/Life under occupation/5-1052 copia.jpg",
        title: "Life under occupation",
        description: "1052 copia",
      },
      {
        id: 206,
        url: "./assets/Palestina/Life under occupation/6-IMG_9942.jpg",
        title: "",
        description: "IMG_9942.jpg",
      },
      {
        id: 207,
        url: "./assets/Palestina/Life under occupation/7-IMG_4180.jpg",
        title: "Life under occupation",
        description: "IMG_4180",
      },
      {
        id: 208,
        url: "./assets/Palestina/Life under occupation/8-IMG_3083-22-45X35.jpg",
        title: "Life under occupation",
        description: "IMG_3083-22-45X35",
      },
      {
        id: 209,
        url: "./assets/Palestina/Life under occupation/9-IMG_0900.jpg",
        title: "Life under occupation",
        description: "IMG_0900",
      },
      {
        id: 210,
        url: "./assets/Palestina/Life under occupation/10-272-2-222-45X30 (2).jpg",
        title: "",
        description: "272-2-222-45X30 (2)",
      },
      {
        id: 211,
        url: "./assets/Palestina/Life under occupation/11-IMG_1179.jpg",
        title: "",
        description: "IMG_1179",
      },
      {
        id: 212,
        url: "./assets/Palestina/Life under occupation/12-IMG_4587.jpg",
        title: "Life under occupation",
        description: "IMG_4587",
      },
      {
        id: 213,
        url: "./assets/Palestina/Life under occupation/13-IMG_6524-45x30 (2).jpg",
        title: "Life under occupation",
        description: "IMG_6524-45x30 (2)",
      },
      {
        id: 214,
        url: "./assets/Palestina/Life under occupation/14-IMG_7847.jpg",
        title: "",
        description: "IMG_7847",
      },
      {
        id: 215,
        url: "./assets/Palestina/Life under occupation/15-IMG_9937 (30x45).jpg",
        title: "Life under occupation",
        description: "IMG_9937 (30x45)",
      },
      {
        id: 216,
        url: "./assets/Palestina/Life under occupation/16-IMG_232222.jpg",
        title: "",
        description: "IMG_232222",
      },
      {
        id: 217,
        url: "./assets/Palestina/Life under occupation/17-295 (18x13).jpg",
        title: "",
        description: "295 (18x13)",
      },
    ],
  },
  {
    id: 5,
    title: "elMuroTitulo",
    location: "Palestina (2013-2022)",
    cover: "./assets/Palestina/The Wall/1-5-2-2014 879.jpg",
    photos: [
      {
        id: 300,
        url: "",
        title: "Introduction",
        description: "elMuroTexto",
      },
      {
        id: 301,
        url: "./assets/Palestina/The Wall/1-5-2-2014 879.jpg",
        title: "The Wall",
        description: "1-5-2-2014 879",
      },
      {
        id: 302,
        url: "./assets/Palestina/The Wall/2-IMG_7197.jpg",
        title: "The Wall",
        description: "IMG_7197",
      },
      {
        id: 303,
        url: "./assets/Palestina/The Wall/3-2IMG_8477.jpg",
        title: "The Wall",
        description: "2IMG_8477",
      },
      {
        id: 304,
        url: "./assets/Palestina/The Wall/4-IMG_6984.jpg",
        title: "The Wall",
        description: "IMG_6984",
      },
      {
        id: 305,
        url: "./assets/Palestina/The Wall/5-2-2014 1002.jpg",
        title: "The Wall",
        description: "5-2-2014 1002",
      },
      {
        id: 306,
        url: "./assets/Palestina/The Wall/6-IMG_7038 - copia-2.jpg",
        title: "The Wall",
        description: "IMG_7038-copia-2",
      },
      {
        id: 307,
        url: "./assets/Palestina/The Wall/7-084.jpg",
        title: "The Wall",
        description: "084",
      },
      {
        id: 308,
        url: "./assets/Palestina/The Wall/8-312 (2).jpg",
        title: "The Wall",
        description: "312 (2)",
      },
      {
        id: 309,
        url: "./assets/Palestina/The Wall/9-IMG_6731.jpg",
        title: "The Wall",
        description: "IMG_6731",
      },
      {
        id: 310,
        url: "./assets/Palestina/The Wall/10-IMG_7660.jpg",
        title: "The Wall",
        description: "IMG_7660",
      },
      {
        id: 311,
        url: "./assets/Palestina/The Wall/11-20140429_180729.jpg",
        title: "The Wall",
        description: "20140429_180729",
      },
      {
        id: 312,
        url: "./assets/Palestina/The Wall/12-IMG_9789-45x30.jpg",
        title: "The Wall",
        description: "IMG_9789-45x30",
      },
      {
        id: 313,
        url: "./assets/Palestina/The Wall/13-IMG_7932.jpg",
        title: "The Wall",
        description: "IMG_7932",
      },
      {
        id: 314,
        url: "./assets/Palestina/The Wall/14-IMG_8258.jpg",
        title: "The Wall",
        description: "IMG_8258",
      },
    ],
  },
  {
    id: 6,
    title: "festejosCopaDelMundoTitulo",
    location: "Buenos Aires, Argentina (2022)",
    cover: "./assets/Festejos de la Copa del Mundo/1-1671406914960 (2).jpg",
    photos: [
      {
        id: 901,
        url: "./assets/Festejos de la Copa del Mundo/1-1671406914960 (2).jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671469016960",
      },
      {
        id: 902,
        url: "./assets/Festejos de la Copa del Mundo/2-1671406522198.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406522198",
      },
      {
        id: 903,
        url: "./assets/Festejos de la Copa del Mundo/3-IMG_4986.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "IMG_4986",
      },
      {
        id: 904,
        url: "./assets/Festejos de la Copa del Mundo/4-1671406653099.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406653099",
      },
      {
        id: 905,
        url: "./assets/Festejos de la Copa del Mundo/5-IMG_5085.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "IMG_5085",
      },
      {
        id: 906,
        url: "./assets/Festejos de la Copa del Mundo/6-1671406612263.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406612263",
      },
      {
        id: 907,
        url: "./assets/Festejos de la Copa del Mundo/7-1671406869954.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406869954",
      },
      {
        id: 908,
        url: "./assets/Festejos de la Copa del Mundo/8-IMG_5105.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "IMG_5105",
      },
    ],
  },
  {
    id: 7,
    title: "covidTitulo",
    location: "Buenos Aires, Argentina (2020)",
    cover:
      "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/IMG_9289-22.jpg",
    photos: [
      {
        id: 400,
        url: "",
        title: "Introduction",
        description: "covidTexto",
      },
      {
        id: 401,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/1-IMG_9033.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9033",
      },
      {
        id: 402,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/2-IMG_9216.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9216",
      },
      {
        id: 403,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/3-IMG_9135.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9135",
      },
      {
        id: 404,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/4-IMG_8910-1.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_8910-1",
      },
      {
        id: 405,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/5-IMG_9137.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9137",
      },
      {
        id: 406,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/6-IMG_9244-1.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9244-1",
      },
      {
        id: 407,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/IMG_9269-1.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9269-1",
      },
      {
        id: 408,
        url: "./assets/Buenos Aires - Covid 19 Donde el tiempo se detiene/IMG_9289-22.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9289-22",
      },
    ],
  },
  {
    id: 8,
    title: "motinTitulo",
    location: "Buenos Aires, Argentina (2020)",
    cover: "./assets/Motin Carcel Devoto/1-IMG_97233.jpg",
    photos: [
      {
        id: 801,
        url: "./assets/Motin Carcel Devoto/1-IMG_97233.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9723",
      },
      {
        id: 802,
        url: "./assets/Motin Carcel Devoto/2-IMG_9660.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9660",
      },
      {
        id: 803,
        url: "./assets/Motin Carcel Devoto/3-IMG_9780.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9780",
      },
      {
        id: 804,
        url: "./assets/Motin Carcel Devoto/4-IMG_9414.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9414",
      },
      {
        id: 805,
        url: "./assets/Motin Carcel Devoto/5-IMG_9360.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9360",
      },
      {
        id: 806,
        url: "./assets/Motin Carcel Devoto/6-IMG_9518.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9518",
      },
      {
        id: 807,
        url: "./assets/Motin Carcel Devoto/7-IMG_9707.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9707",
      },
      {
        id: 808,
        url: "./assets/Motin Carcel Devoto/8-IMG_9729.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9729",
      },
      {
        id: 809,
        url: "./assets/Motin Carcel Devoto/9-IMG_9968.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9968",
      },
    ],
  },
  {
    id: 9,
    title: "mujeresTitulo",
    location: "(2010-2019)",
    cover: "./assets/Mujeres/1-india 1669 (2).jpg",
    photos: [
      {
        id: 700,
        url: "",
        title: "Introduction",
        description: "mujeresTexto",
      },
      {
        id: 701,
        url: "./assets/Mujeres/1-india 1669 (2).jpg",
        title: "Mujeres",
        description: "india 1669",
      },
      {
        id: 702,
        url: "./assets/Mujeres/2-9.jpg",
        title: "Mujeres",
        description: "3",
      },
      {
        id: 703,
        url: "./assets/Mujeres/3-Imagen 1540.jpg",
        title: "Mujeres",
        description: "Imagen 1540",
      },
      {
        id: 704,
        url: "./assets/Mujeres/4-Copia de india 777.jpg",
        title: "Mujeres",
        description: "Copia de india 777",
      },
      {
        id: 705,
        url: "./assets/Mujeres/5-india 1008.jpg",
        title: "Mujeres",
        description: "india 1008",
      },
      {
        id: 706,
        url: "./assets/Mujeres/6-prueba3 (1 de 1).jpg",
        title: "Mujeres",
        description: "prueba3 (1 de 1)",
      },
      {
        id: 707,
        url: "./assets/Mujeres/7-india 31011.jpg",
        title: "Mujeres",
        description: "india 31011",
      },
      {
        id: 708,
        url: "./assets/Mujeres/8-IMG_0975.jpg",
        title: "Mujeres",
        description: "IMG_0975",
      },
      {
        id: 709,
        url: "./assets/Mujeres/9-IMG_7005.jpg",
        title: "Mujeres",
        description: "IMG_7005",
      },
      {
        id: 710,
        url: "./assets/Mujeres/10-india 2110 (2).jpg",
        title: "Mujeres",
        description: "india 2110 (2)",
      },
      {
        id: 711,
        url: "./assets/Mujeres/11-IMG_4688 (30X45) (2).jpg",
        title: "Mujeres",
        description: "IMG_4688 (30X45) (2)",
      },
      {
        id: 712,
        url: "./assets/Mujeres/12-Imagen 1871.jpg",
        title: "Mujeres",
        description: "Imagen 1871",
      },
      {
        id: 713,
        url: "./assets/Mujeres/13-india 2520.jpg",
        title: "Mujeres",
        description: "india 2520",
      },
      {
        id: 714,
        url: "./assets/Mujeres/14-IMG_4901.jpg",
        title: "Mujeres",
        description: "IMG_4901",
      },
      {
        id: 715,
        url: "./assets/Mujeres/15-IMG_485220X30 (2).jpg",
        title: "Mujeres",
        description: "IMG_485220X30 (2)",
      },
      {
        id: 716,
        url: "./assets/Mujeres/16-sudeste 5125 30x45.jpg",
        title: "Mujeres",
        description: "sudeste 5125 30x45",
      },
      {
        id: 717,
        url: "./assets/Mujeres/17-IMG_0909.jpg",
        title: "Mujeres",
        description: "IMG_0909",
      },
      {
        id: 718,
        url: "./assets/Mujeres/18-india 873.jpg",
        title: "Mujeres",
        description: "india 873",
      },
      {
        id: 719,
        url: "./assets/Mujeres/19-sudeste 2924.jpg",
        title: "Mujeres",
        description: "sudeste 2924",
      },
    ],
  },
  {
    id: 10,
    title: "qomTitulo",
    location: "Formosa, Argentina (2013)",
    cover: "./assets/Comunidad Qom- Potae Napocna Navogoh/1-IMG_2495.jpg",
    photos: [
      {
        id: 501,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/1-IMG_2495.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2495",
      },
      {
        id: 502,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/2-IMG_2545.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2545",
      },
      {
        id: 503,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/3-IMG_2532.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2532",
      },
      {
        id: 504,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/4-IMG_2582.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2582",
      },
      {
        id: 505,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/5-IMG_2634.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2634",
      },
      {
        id: 506,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/6-IMG_3057.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_3057",
      },
      {
        id: 507,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/7-IMG_2637.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2637",
      },
      {
        id: 508,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/8-IMG_2691.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2691",
      },
      {
        id: 509,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/9-IMG_3021.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_3021",
      },
      {
        id: 510,
        url: "./assets/Comunidad Qom- Potae Napocna Navogoh/10-IMG_3500.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_3500",
      },
    ],
  },
  {
    id: 11,
    title: "laosTitulo",
    location: "Viang Xai, Laos (2012)",
    cover:
      "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/1-sudeste 2924.jpg",
    photos: [
      {
        id: 101,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/1-sudeste 2924.jpg",
        title: "Sudeste",
        description: "2924",
      },
      {
        id: 102,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/2-Fotos 5929.jpg",
        title: "Sudeste",
        description: "5929",
      },
      {
        id: 103,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/3-sudeste 2831.jpg",
        title: "Sudeste",
        description: "2831",
      },
      {
        id: 104,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/4-sudeste 2833.jpg",
        title: "Sudeste",
        description: "2833",
      },
      {
        id: 105,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/5-sudeste 2854.jpg",
        title: "Sudeste",
        description: "2854",
      },
      {
        id: 106,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/6-sudeste 2880.jpg",
        title: "Sudeste",
        description: "2880",
      },
      {
        id: 107,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/7-sudeste 2928.jpg",
        title: "Sudeste",
        description: "2928",
      },
      {
        id: 108,
        url: "./assets/Phengsy Sommany, ícono de la resistencia de Laosiana/8-sudeste 2932.jpg",
        title: "Sudeste",
        description: "2932",
      },
    ],
  },
];

const folderGrid = document.getElementById("folderGrid");
folderGrid.className = "folder-grid";
const carouselModal = document.getElementById("carouselModal");
const carouselImg = document.getElementById("carouselImg");
const carouselCaption = document.getElementById("carouselCaption");
const carouselDescription = document.getElementById("carouselDescription");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentFolder = null;
let currentPhotoIndex = 0;

function renderFolderGrid() {
  folderGrid.innerHTML = "";
  photoFolders.forEach((folder) => {
    const folderItem = document.createElement("div");
    folderItem.className = "folder-item";
    folderItem.innerHTML = `
            <div class="folder-image-container">
                ${
                  folder.cover
                    ? `<img src="${folder.cover}" alt="${i18next.t(
                        folder.title
                      )}" loading="lazy">`
                    : `<div class="folder-text">${i18next.t(
                        folder.title
                      )}</div>`
                }
            </div>
            <div class="folder-content">
                <div class="folder-title">${i18next.t(folder.title)}</div>
                <div class="folder-subtitle">${i18next.t(folder.location)}</div>
            </div>
        `;
    folderItem.addEventListener("click", () => openCarousel(folder));
    folderGrid.appendChild(folderItem);
  });
}

function openCarousel(folder) {
  currentFolder = folder;
  currentPhotoIndex = 0;
  updateCarouselContent();
  carouselModal.style.display = "flex";
  document.body.style.overflow = "hidden";
  carouselModal.setAttribute("aria-hidden", "false");
  showCarouselControls();
}

function closeCarousel() {
  carouselModal.style.display = "none";
  document.body.style.overflow = "auto";
  carouselModal.setAttribute("aria-hidden", "true");
}

function updateCarouselContent() {
  const photo = currentFolder.photos[currentPhotoIndex];

  if (photo.url) {
    carouselImg.src = ""; // Limpia la src anterior
    carouselImg.setAttribute("data-src", photo.url);
    carouselImg.alt = i18next.t(photo.title);
    carouselImg.style.display = "block";
    carouselDescription.style.display = "none";

    // Usa Intersection Observer para cargar la imagen
    if ("IntersectionObserver" in window) {
      const lazyImageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              let lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.removeAttribute("data-src");
              lazyImageObserver.unobserve(lazyImage);
            }
          });
        }
      );

      lazyImageObserver.observe(carouselImg);
    } else {
      // Fallback para navegadores que no soportan Intersection Observer
      carouselImg.src = photo.url;
    }
  } else {
    carouselImg.style.display = "none";
    carouselDescription.textContent = i18next.t(photo.description);
    carouselDescription.style.display = "flex";
  }

  showCarouselControls();
}

function showCarouselControls() {
  prevBtn.style.display = "block";
  nextBtn.style.display = "block";
}

function showPrevious() {
  currentPhotoIndex =
    (currentPhotoIndex - 1 + currentFolder.photos.length) %
    currentFolder.photos.length;
  updateCarouselContent();
}

function showNext() {
  currentPhotoIndex = (currentPhotoIndex + 1) % currentFolder.photos.length;
  updateCarouselContent();
}

// Event Listeners
closeBtn.addEventListener("click", closeCarousel);
prevBtn.addEventListener("click", showPrevious);
nextBtn.addEventListener("click", showNext);

window.addEventListener("click", (e) => {
  if (e.target === carouselModal) {
    closeCarousel();
  }
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  i18next.on("languageChanged", () => {
    renderFolderGrid();
    if (currentFolder) {
      updateCarouselContent();
    }
  });

  renderFolderGrid();
});
