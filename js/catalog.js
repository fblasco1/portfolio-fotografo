const cl = window.cloudinary.Cloudinary.new({ cloud_name: "dnc5bzm8o" });

const photoFolders = [
  {
    id: 1,
    title: "eraMileiTitulo",
    location: "Buenos Aires, Argentina (2023-2024)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753240/1-20231210182626_IMG_0828_vctywt.jpg",
    photos: [
      {
        id: 1100,
        url: "",
        title: "La era Milei",
        description: "eraMileiTexto",
      },
      {
        id: 1101,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753240/1-20231210182626_IMG_0828_vctywt.jpg",
        title: "La era Milei",
        description: "20231210182626_IMG_0828",
      },
      {
        id: 1102,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753240/2-20231210164355_IMG_0750_x5kwt7.jpg",
        title: "La era Milei",
        description: "20231210164355_IMG_0750",
      },
      {
        id: 1103,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753241/3-20231210163638_IMG_0735_xnlesh.jpg",
        title: "La era Milei",
        description: "20231210163638_IMG_0735",
      },
      {
        id: 1104,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753241/4-IMG_0766_omkf6n.jpg",
        title: "La era Milei",
        description: "IMG_0766",
      },
      {
        id: 1105,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753242/5-20240201003106_IMG_3329_o4mp2t.jpg",
        title: "La era Milei",
        description: "20240201003106_IMG_3329",
      },
      {
        id: 1106,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753248/6-20240202002754_IMG_3554_vmrcw2.jpg",
        title: "La era Milei",
        description: "20240202002754_IMG_3554",
      },
      {
        id: 1107,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753248/7-20240423225418_IMG_6902_asaej5.jpg",
        title: "La era Milei",
        description: "20240423225418_IMG_6902",
      },
      {
        id: 1108,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753249/8-20240201004731_IMG_3378_ab5h33.jpg",
        title: "La era Milei",
        description: "20240201004731_IMG_3378",
      },
      {
        id: 1109,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753250/9-20240202001932_IMG_3523_ux1wxc.jpg",
        title: "La era Milei",
        description: "20240202001932_IMG_3523",
      },
      {
        id: 1110,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753253/10-20240509155920_IMG_8121_fyrdiz.jpg",
        title: "La era Milei",
        description: "20240509155920_IMG_8121",
      },
      {
        id: 1111,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753262/11-20240509161104_IMG_8146_f8ptu8.jpg",
        title: "La era Milei",
        description: "20240509161104_IMG_8146",
      },
      {
        id: 1112,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753263/12-20240124185231_IMG_2773_jjuqwo.jpg",
        title: "La era Milei",
        description: "20240124185231_IMG_2773",
      },
      {
        id: 1113,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753263/13-20240523033719_IMG_8807_vmh8kp.jpg",
        title: "La era Milei",
        description: "20240523033719_IMG_8807",
      },
      {
        id: 1114,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753264/14-20240523023229_IMG_8526_hmkvda.jpg",
        title: "La era Milei",
        description: "20240523023229_IMG_8526",
      },
      {
        id: 1115,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753275/15-20240807191749_IMG_1332_1_l1brn2.jpg",
        title: "La era Milei",
        description: "20240807191749_IMG_1332",
      },
      {
        id: 1116,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753277/16-Cristian_Pirovano_Ley_Bases_II_bdwxfb.jpg",
        title: "La era Milei",
        description: "Cristian Pirovano_Ley Bases II",
      },
      {
        id: 1117,
        url: ".https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753278/17-IMG_0483_jkgwy5.jpg",
        title: "La era Milei",
        description: "IMG_0483",
      },
      {
        id: 1118,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753283/18-Cristian_Pirovano_Ley_Bases_I__ohipdg.jpg",
        title: "La era Milei",
        description: "Cristian Pirovano_Ley Bases I",
      },
      {
        id: 1119,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753284/19-1727736511720_eclj74.jpg",
        title: "La era Milei",
        description: "1727736511720",
      },
      {
        id: 1120,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753284/20-1727736488261_nvarbj.jpg",
        title: "La era Milei",
        description: "1727736488261",
      },
      {
        id: 1121,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753285/21-1727736511735_hbhn6n.jpg",
        title: "La era Milei",
        description: "1727736511735",
      },
      {
        id: 1122,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753285/22-1727736635216_n78oqd.jpg",
        title: "La era Milei",
        description: "1727736635216",
      },
      {
        id: 1123,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753286/23-1727736972516_fsxblk.jpg",
        title: "La era Milei",
        description: "1727736972516",
      },
      {
        id: 1124,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753301/24-1727736635184_vljw5g.jpg",
        title: "La era Milei",
        description: "1727736635184",
      },
      {
        id: 1125,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753303/25-1727736682981_m1c4np.jpg",
        title: "La era Milei",
        description: "1727736682981",
      },
      {
        id: 1126,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753311/26-1727736607429_krvk8y.jpg",
        title: "La era Milei",
        description: "1727736607429",
      },
      {
        id: 1127,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753317/27-1727736463478_fmixcg.jpg",
        title: "La era Milei",
        description: "1727736463478",
      },
      {
        id: 1128,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753324/28-1727736463464_nlq1eq.jpg",
        title: "La era Milei",
        description: "1727736463464",
      },
      {
        id: 1129,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753329/29-1727736534209_cstqlt.jpg",
        title: "La era Milei",
        description: "1727736534209",
      },
      {
        id: 1130,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753330/30-1727736635201_bsbhuq.jpg",
        title: "La era Milei",
        description: "1727736635201",
      },
      {
        id: 1131,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753331/31-1727736488229_mw6iv6.jpg",
        title: "La era Milei",
        description: "1727736488229",
      },
      {
        id: 1132,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753331/32-1727736682966_dpmd3k.jpg",
        title: "La era Milei",
        description: "1727736682966",
      },
    ],
  },
  {
    id: 2,
    title: "yerbaMateTitulo",
    location: "Misiones, Argentina (2024)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754526/1-IMG_9571_lfxxwm.jpg",
    photos: [
      {
        id: 601,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754526/1-IMG_9571_lfxxwm.jpg",
        title: "Yerba Mate",
        description: "IMG_9571",
      },
      {
        id: 602,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754557/2-IMG_9471_opnlgc.jpg",
        title: "Yerba Mate",
        description: "IMG_9477",
      },
      {
        id: 603,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754571/3-IMG_9711_mexzmn.jpg",
        title: "Yerba Mate",
        description: "IMG_9711",
      },
      {
        id: 604,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754550/4-IMG_9467_wq3poj.jpg",
        title: "Yerba Mate",
        description: "IMG_9467",
      },
      {
        id: 605,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754561/5-IMG_9626_vxc4a0.jpg",
        title: "Yerba Mate",
        description: "IMG_9626",
      },
      {
        id: 606,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754583/6-IMG_9719_ji8bro.jpg",
        title: "Yerba Mate",
        description: "IMG_9719",
      },
      {
        id: 607,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754583/6-IMG_9719_ji8bro.jpg",
        title: "Yerba Mate",
        description: "IMG_9501",
      },
      {
        id: 608,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754564/8-IMG_9755_1_kfbrlg.jpg",
        title: "Yerba Mate",
        description: "IMG_9755",
      },
      {
        id: 609,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754552/9-IMG_9775_1_q3aqyr.jpg",
        title: "Yerba Mate",
        description: "IMG_9775",
      },
      {
        id: 610,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754566/10-IMG_9984_culsvk.jpg",
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
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754333/Bunker_Javier_Milei_III._Cristian_Pirovano_qpzyml.jpg",
    photos: [
      {
        id: 1001,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754333/Bunker_Javier_Milei_III._Cristian_Pirovano_qpzyml.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei III",
      },
      {
        id: 1002,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754328/Bunker_Javier_Milei_IV._Cristian_Pirovano_uyy7tc.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei IV",
      },
      {
        id: 1003,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754328/Bunker_Javier_Milei_IV._Cristian_Pirovano_uyy7tc.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Javier Milei",
      },
      {
        id: 1004,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754338/Bunker_Sergio_Massa_II._Cristian_Pirovano_gltstv.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Bunker Sergio Massa II",
      },
      {
        id: 1005,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754329/Entrada_de_colegio_Carlos_Pellegrini_II._Cristian_Pirovano_fscf2v.jpg",
        title: "Elecciones Presidenciales 2023-Ballotaje",
        description: "Entrada de colegio Carlos Pellegrini II",
      },
    ],
  },
  {
    id: 4,
    title: "vidaBajoOcupacionTitulo",
    location: "Palestina (2013-2022)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754289/1-IMG_3509-3-30x45_jd8aut.jpg",
    photos: [
      {
        id: 200,
        url: "",
        title: "Introduction",
        description: "vidaBajoOcupacionTexto",
      },
      {
        id: 201,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754289/1-IMG_3509-3-30x45_jd8aut.jpg",
        title: "Life under occupation",
        description: "IMG_3509-3-30x45",
      },
      {
        id: 202,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754284/2-IMG_8366_h5uzph.jpg",
        title: "",
        description: "IMG_8366",
      },
      {
        id: 203,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754297/3-IMG_3197_30x45_uuswqx.jpg",
        title: "Life under occupation",
        description: "IMG_3197 30x45",
      },
      {
        id: 204,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754294/4-976-45x30_2_qnngev.jpg",
        title: "",
        description: "976-45x30 (2)",
      },
      {
        id: 205,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754256/5-1052_copia_iewm8h.jpg",
        title: "Life under occupation",
        description: "1052 copia",
      },
      {
        id: 206,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754257/6-IMG_9942_kjtpen.jpg",
        title: "",
        description: "IMG_9942.jpg",
      },
      {
        id: 207,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754260/7-IMG_4180_ch9t2m.jpg",
        title: "Life under occupation",
        description: "IMG_4180",
      },
      {
        id: 208,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754267/8-IMG_3083-22-45X35_ux2ga5.jpg",
        title: "Life under occupation",
        description: "IMG_3083-22-45X35",
      },
      {
        id: 209,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754272/9-IMG_0900_kq0llj.jpg",
        title: "Life under occupation",
        description: "IMG_0900",
      },
      {
        id: 210,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754277/10-272-2-222-45X30_2_qtpn9b.jpg",
        title: "",
        description: "272-2-222-45X30 (2)",
      },
      {
        id: 211,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754282/11-IMG_1179_ovfvzd.jpg",
        title: "",
        description: "IMG_1179",
      },
      {
        id: 212,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754295/12-IMG_4587_g9zrqe.jpg",
        title: "Life under occupation",
        description: "IMG_4587",
      },
      {
        id: 213,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754292/13-IMG_6524-45x30_2_s8pvyd.jpg",
        title: "Life under occupation",
        description: "IMG_6524-45x30 (2)",
      },
      {
        id: 214,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754280/14-IMG_7847_biyrwj.jpg",
        title: "",
        description: "IMG_7847",
      },
      {
        id: 215,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754252/15-IMG_9937_30x45_h34jes.jpg",
        title: "Life under occupation",
        description: "IMG_9937 (30x45)",
      },
      {
        id: 216,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754278/16-IMG_232222_lzm4ig.jpg",
        title: "",
        description: "IMG_232222",
      },
      {
        id: 217,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754293/17-295_18x13_vgogpy.jpg",
        title: "",
        description: "295 (18x13)",
      },
    ],
  },
  {
    id: 5,
    title: "elMuroTitulo",
    location: "Palestina (2013-2022)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753900/1-5-2-2014_879_cwwmja.jpg",
    photos: [
      {
        id: 300,
        url: "",
        title: "Introduction",
        description: "elMuroTexto",
      },
      {
        id: 301,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753900/1-5-2-2014_879_cwwmja.jpg",
        title: "The Wall",
        description: "1-5-2-2014 879",
      },
      {
        id: 302,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753902/2-IMG_7197_qtmo83.jpg",
        title: "The Wall",
        description: "IMG_7197",
      },
      {
        id: 303,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753906/3-2IMG_8477_r28zle.jpg",
        title: "The Wall",
        description: "2IMG_8477",
      },
      {
        id: 304,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753908/4-IMG_6984_rhme0d.jpg",
        title: "The Wall",
        description: "IMG_6984",
      },
      {
        id: 305,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753911/5-2-2014_1002_u45oit.jpg",
        title: "The Wall",
        description: "5-2-2014 1002",
      },
      {
        id: 306,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753918/6-IMG_7038_-_copia-2_nnguaz.jpg",
        title: "The Wall",
        description: "IMG_7038-copia-2",
      },
      {
        id: 307,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753887/7-084_bkfhv0.jpg",
        title: "The Wall",
        description: "084",
      },
      {
        id: 308,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753889/8-312_2_snluxu.jpg",
        title: "The Wall",
        description: "312 (2)",
      },
      {
        id: 309,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753899/9-IMG_6731_kxu0jj.jpg",
        title: "The Wall",
        description: "IMG_6731",
      },
      {
        id: 310,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753895/10-IMG_7660_fwjz0b.jpg",
        title: "The Wall",
        description: "IMG_7660",
      },
      {
        id: 311,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753888/11-20140429_180729_kannty.jpg",
        title: "The Wall",
        description: "20140429_180729",
      },
      {
        id: 312,
        url: ".https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753894/12-IMG_9789-45x30_isby0q.jpg",
        title: "The Wall",
        description: "IMG_9789-45x30",
      },
      {
        id: 313,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753913/13-IMG_7932_jmkjxg.jpg",
        title: "The Wall",
        description: "IMG_7932",
      },
      {
        id: 314,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753917/14-IMG_8258_kstzs9.jpg",
        title: "The Wall",
        description: "IMG_8258",
      },
    ],
  },
  {
    id: 6,
    title: "festejosCopaDelMundoTitulo",
    location: "Buenos Aires, Argentina (2022)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754357/1-1671406914960_2_j5glgj.jpg",
    photos: [
      {
        id: 901,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754357/1-1671406914960_2_j5glgj.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671469016960",
      },
      {
        id: 902,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754344/2-1671406522198_ygq4zb.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406522198",
      },
      {
        id: 903,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754360/3-IMG_4986_fbdpcw.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "IMG_4986",
      },
      {
        id: 904,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754345/4-1671406653099_uamfuc.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406653099",
      },
      {
        id: 905,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754353/5-IMG_5085_wsekrz.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "IMG_5085",
      },
      {
        id: 906,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754351/6-1671406612263_i4gidu.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406612263",
      },
      {
        id: 907,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754358/7-1671406869954_iwcmy3.jpg",
        title: "Festejos de la Copa del Mundo",
        description: "1671406869954",
      },
      {
        id: 908,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754358/7-1671406869954_iwcmy3.jpg",
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
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753519/IMG_9289-22_bok2a1.jpg",
    photos: [
      {
        id: 400,
        url: "",
        title: "Introduction",
        description: "covidTexto",
      },
      {
        id: 401,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753520/1-IMG_9033_aufma6.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9033",
      },
      {
        id: 402,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753522/2-IMG_9216_w1nlce.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9216",
      },
      {
        id: 403,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753510/3-IMG_9135_mooqop.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9135",
      },
      {
        id: 404,
        url: ".https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753516/4-IMG_8910-1_po2rra.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_8910-1",
      },
      {
        id: 405,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753524/5-IMG_9137_kpw6iv.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9137",
      },
      {
        id: 406,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753511/6-IMG_9244-1_r5uaqr.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9244-1",
      },
      {
        id: 407,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753512/IMG_9269-1_tr7niv.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9269-1",
      },
      {
        id: 408,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733753519/IMG_9289-22_bok2a1.jpg",
        title: "Covid 19 Donde el tiempo se detiene",
        description: "IMG_9289-22",
      },
    ],
  },
  {
    id: 8,
    title: "motinTitulo",
    location: "Buenos Aires, Argentina (2020)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754375/1-IMG_97233_r15kfq.jpg",
    photos: [
      {
        id: 801,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754375/1-IMG_97233_r15kfq.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9723",
      },
      {
        id: 802,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754381/2-IMG_9660_em46ee.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9660",
      },
      {
        id: 803,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754380/3-IMG_9780_qirm7b.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9780",
      },
      {
        id: 804,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754374/4-IMG_9414_zohy9t.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9414",
      },
      {
        id: 805,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754391/5-IMG_9360_tuzqgd.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9360",
      },
      {
        id: 806,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754389/6-IMG_9518_mudgce.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9518",
      },
      {
        id: 807,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754383/7-IMG_9707_hmsuel.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9707",
      },
      {
        id: 808,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754377/8-IMG_9729_e73jxj.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9729",
      },
      {
        id: 809,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754368/9-IMG_9968_garv4s.jpg",
        title: "Motin Carcel Devoto",
        description: "IMG_9968",
      },
    ],
  },
  {
    id: 9,
    title: "mujeresTitulo",
    location: "(2010-2019)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754413/1-india_1669_2_b7o47r.jpg",
    photos: [
      {
        id: 700,
        url: "",
        title: "Introduction",
        description: "mujeresTexto",
      },
      {
        id: 701,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754413/1-india_1669_2_b7o47r.jpg",
        title: "Mujeres",
        description: "india 1669",
      },
      {
        id: 702,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754434/2-9_xw0pci.jpg",
        title: "Mujeres",
        description: "3",
      },
      {
        id: 703,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754427/3-Imagen_1540_xnytvi.jpg",
        title: "Mujeres",
        description: "Imagen 1540",
      },
      {
        id: 704,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754422/4-Copia_de_india_777_jar7ei.jpg",
        title: "Mujeres",
        description: "Copia de india 777",
      },
      {
        id: 705,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754424/5-india_1008_uk4hte.jpg",
        title: "Mujeres",
        description: "india 1008",
      },
      {
        id: 706,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754406/6-prueba3_1_de_1_r3s76m.jpg",
        title: "Mujeres",
        description: "prueba3 (1 de 1)",
      },
      {
        id: 707,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754401/7-india_31011_geerss.jpg",
        title: "Mujeres",
        description: "india 31011",
      },
      {
        id: 708,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754412/8-IMG_0975_hkiwzy.jpg",
        title: "Mujeres",
        description: "IMG_0975",
      },
      {
        id: 709,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754414/9-IMG_7005_huq6yp.jpg",
        title: "Mujeres",
        description: "IMG_7005",
      },
      {
        id: 710,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754404/10-india_2110_2_mtck1u.jpg",
        title: "Mujeres",
        description: "india 2110 (2)",
      },
      {
        id: 711,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754398/11-IMG_4688_30x45_2_mfv7if.jpg",
        title: "Mujeres",
        description: "IMG_4688 (30X45) (2)",
      },
      {
        id: 712,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754432/12-Imagen_1871_jbegsp.jpg",
        title: "Mujeres",
        description: "Imagen 1871",
      },
      {
        id: 713,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754417/13-india_2520_txkaif.jpg",
        title: "Mujeres",
        description: "india 2520",
      },
      {
        id: 714,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754403/14-IMG_4901_rbikjh.jpg",
        title: "Mujeres",
        description: "IMG_4901",
      },
      {
        id: 715,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754420/15-IMG_485220x30_2_jeu1uh.jpg",
        title: "Mujeres",
        description: "IMG_485220X30 (2)",
      },
      {
        id: 716,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754436/16-sudeste_5125_30x45_gvsqmv.jpg",
        title: "Mujeres",
        description: "sudeste 5125 30x45",
      },
      {
        id: 717,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754437/17-IMG_0909_vqexqu.jpg",
        title: "Mujeres",
        description: "IMG_0909",
      },
      {
        id: 718,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754430/18-india_873_vg0wrm.jpg",
        title: "Mujeres",
        description: "india 873",
      },
      {
        id: 719,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754394/19-sudeste_2924_d5jbx9.jpg",
        title: "Mujeres",
        description: "sudeste 2924",
      },
    ],
  },
  {
    id: 10,
    title: "qomTitulo",
    location: "Formosa, Argentina (2013)",
    cover:
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754320/1-IMG_2495_ev4nd0.jpg",
    photos: [
      {
        id: 501,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754320/1-IMG_2495_ev4nd0.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2495",
      },
      {
        id: 502,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754310/2-IMG_2545_aberru.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2545",
      },
      {
        id: 503,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754324/3-IMG_2532_enevub.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2532",
      },
      {
        id: 504,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754300/4-IMG_2582_aq2mz3.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2582",
      },
      {
        id: 505,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754317/5-IMG_2634_by0bzq.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2634",
      },
      {
        id: 506,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754306/6-IMG_3057_ix2dej.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_3057",
      },
      {
        id: 507,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754305/7-IMG_2637_zoqcue.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2637",
      },
      {
        id: 508,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754308/8-IMG_2691_xxwtuk.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_2691",
      },
      {
        id: 509,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754313/9-IMG_3021_i4l5j9.jpg",
        title: "Comunidad Qom - Potae Napocna Navogoh",
        description: "IMG_3021",
      },
      {
        id: 510,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754325/10-IMG_3500_h8uac6.jpg",
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
      "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754450/1-sudeste_2924_ofuqks.jpg",
    photos: [
      {
        id: 101,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754450/1-sudeste_2924_ofuqks.jpg",
        title: "Sudeste",
        description: "2924",
      },
      {
        id: 102,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754444/2-Fotos_5929_nfcs8m.jpg",
        title: "Sudeste",
        description: "5929",
      },
      {
        id: 103,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754448/3-sudeste_2831_zeynnz.jpg",
        title: "Sudeste",
        description: "2831",
      },
      {
        id: 104,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754443/4-sudeste_2833_baljfh.jpg",
        title: "Sudeste",
        description: "2833",
      },
      {
        id: 105,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754445/5-sudeste_2854_wzdkvo.jpg",
        title: "Sudeste",
        description: "2854",
      },
      {
        id: 106,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754447/6-sudeste_2880_adb44r.jpg",
        title: "Sudeste",
        description: "2880",
      },
      {
        id: 107,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754440/7-sudeste_2928_dx4jyu.jpg",
        title: "Sudeste",
        description: "2928",
      },
      {
        id: 108,
        url: "https://res.cloudinary.com/dnc5bzm8o/image/upload/v1733754441/8-sudeste_2932_y3zhmc.jpg",
        title: "Sudeste",
        description: "2932",
      },
    ],
  },
];

const folderGrid = document.getElementById("folderGrid");
folderGrid.className = "folder-grid";
const carouselModal = document.getElementById("carouselModal");
const carouselPicture = document.getElementById("carouselPicture");
const carouselImg = document.getElementById("carouselImg");
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

    let coverImage = "";
    if (folder.cover) {
      const transformations = {
        width: 300,
        height: 200,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      };
      const optimizedCoverUrl = cl.url(folder.cover, transformations);
      coverImage = `
        <picture>
          <source media="(max-width: 480px)" srcset="${cl.url(folder.cover, {
            ...transformations,
            width: 150,
            height: 100,
          })}">
          <source media="(max-width: 768px)" srcset="${cl.url(folder.cover, {
            ...transformations,
            width: 250,
            height: 167,
          })}">
          <img src="${optimizedCoverUrl}" alt="${i18next.t(
        folder.title
      )}" loading="lazy">
        </picture>
      `;
    } else {
      coverImage = `<div class="folder-text">${i18next.t(folder.title)}</div>`;
    }

    folderItem.innerHTML = `
      <div class="folder-image-container">
        ${coverImage}
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
    carouselPicture.innerHTML = ""; // Limpia el contenido anterior
    const transformations = {
      quality: "auto",
      fetch_format: "auto",
    };

    const fullUrl = cl.url(photo.url, transformations);

    carouselPicture.innerHTML = `<img class="modal-content" id="carouselImg" src="${fullUrl}" alt="${i18next.t(
      photo.title
    )}">
    `;
    carouselDescription.style.display = "none";
  } else {
    carouselPicture.innerHTML = "";
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

  // Ocultar el spinner cuando todo esté cargado
  window.addEventListener("load", () => {
    document.body.classList.remove("loading");
  });
});
