// Mock/static content for the public /intro landing page.
// Replace with real club data (or a Supabase-backed service) once available —
// the IntroPage component only depends on the shapes below, not on this data being static.
//
// Adding real photos — `image` is just a string, so either works:
//   1. Local file: drop it into the matching src/assets/<folder> (legends/, alumni/, jerseys/,
//      gallery/), import it here, and assign the import, e.g.
//        import khoiPhoto from '../assets/legends/nguyen-van-a.jpg';
//        { name: 'Nguyễn Văn A', ..., image: khoiPhoto }
//   2. Remote URL: paste it directly, e.g. { name: 'Nguyễn Văn A', ..., image: 'https://.../photo.jpg' }
// Items left without `image` keep rendering the placeholder box in IntroPage.tsx.

import jersey2020 from '../assets/jerseys/2020.png';
import jersey2021 from '../assets/jerseys/2021.png';
import jersey2022 from '../assets/jerseys/2022.png';
import jersey2023 from '../assets/jerseys/2023.png';
import jersey2024 from '../assets/jerseys/2024.png';
import jersey2025 from '../assets/jerseys/2025.png';
import jersey2026 from '../assets/jerseys/2026.png';

import ducThanhPhoto from '../assets/legends/duc-thanh.png';
import ngocMinhPhoto from '../assets/legends/ngoc-minh.png';
import tuanAnhPhoto from '../assets/legends/tuan-anh.png';
import ducCrisPhoto from '../assets/legends/duc-cris.png';
import quanHoangPhoto from '../assets/legends/quan-hoang.png';
import hieuPhanPhoto from '../assets/legends/hieu-phan.png';
import ducDatPhoto from '../assets/legends/duc-dat.png';
import huyHoangPhoto from '../assets/legends/huy-hoang.png';
import ducLongPhoto from '../assets/legends/duc-long.png';
import vietAnhPhoto from '../assets/legends/viet-anh.png';
import khanhBinhPhoto from '../assets/legends/khanh-binh.png';
import ngoDaiPhoto from '../assets/legends/ngo-dai.png';
import huyTrungPhoto from '../assets/legends/huy-trung.png';
import ducPhungPhoto from '../assets/legends/duc-phung.png';

export interface ClubProfile {
  name: string;
  foundedYear: number;
  tagline: string;
  description: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface HonourStat {
  label: string;
  value: string;
}

export interface ClubRecord {
  label: string;
  value: string;
  holder?: string;
  note?: string;
}

export interface LegendMember {
  name: string;
  role: string;
  jerseyNumber?: number;
  period: string;
  image?: string;
  description?: string;
}

export interface AlumniMember {
  name: string;
  role?: string;
  period: string;
  image?: string;
}

export interface JerseyEra {
  year: number;
  label: string;
  sponsor?: string;
  image?: string;
}

export interface GalleryPhoto {
  caption: string;
  year: number;
  image?: string;
}

export const clubProfile: ClubProfile = {
  name: 'FC Anh Em',
  foundedYear: 2018,
  tagline: 'Đam mê — Kết nối — Chiến thắng',
  description:
    'Từ một nhóm bạn cùng chung đam mê trái bóng tròn, FC Anh Em đã lớn mạnh thành một câu lạc bộ phong trào gắn bó, thi đấu đều đặn mỗi tuần và không ngừng chinh phục những cột mốc mới.',
};

export const clubTimeline: TimelineMilestone[] = [
  {
    year: '2018',
    title: 'Ra đời từ giảng đường',
    description: 'Một nhóm sinh viên lớp IT2-01-K63 chung niềm đam mê trái bóng tròn rủ nhau lập đội — khởi đầu của một hành trình dài.',
  },
  {
    year: '2018',
    title: 'Hạng Ba ngay lần ra quân',
    description: 'Ngay trong lần đầu góp mặt tại giải bóng đá của Viện Công nghệ Thông tin & Truyền thông, ĐH Bách Khoa Hà Nội, đội đã xuất sắc giành hạng Ba — món quà ra mắt đầy bất ngờ.',
  },
  {
    year: '2019 – 2020',
    title: 'Tạm gác sân cỏ vì Covid-19',
    description: 'Đại dịch khiến những buổi hẹn cuối tuần phải tạm dừng, nhưng cả đội vẫn giữ lửa qua những buổi giao lưu trực tuyến, chờ ngày trở lại.',
  },
  {
    year: '2021',
    title: 'Trở lại và đánh đông dẹp bắc',
    description: 'Cả đội tập trung trở lại, rong ruổi khắp Hà Nội để giao hữu, tìm lại nhịp thi đấu sau thời gian dài gián đoạn.',
  },
  {
    year: '2022',
    title: 'Mở rộng đội hình',
    description: 'Chào đón thêm nhiều thành viên mới cùng trường, duy trì đều đặn lịch thi đấu ít nhất một trận mỗi tuần.',
  },
  {
    year: '2023',
    title: 'Vào vòng 16 đội',
    description: 'Góp mặt ở mùa giải cuối cùng do Viện CNTT & TT tổ chức và xuất sắc lọt vào vòng 16 đội, khép lại một chặng đường đáng nhớ dưới mái trường đại học.',
  },
  {
    year: '2024',
    title: 'Chuyển giao thế hệ',
    description: 'Nhiều thành viên tốt nghiệp ra trường, đội chuyển sang khung giờ đá buổi tối và tuyển thêm lứa cầu thủ mới để tiếp nối ngọn lửa đam mê.',
  },
  {
    year: '2025 – nay',
    title: 'Khẳng định vị thế',
    description: 'Không ngừng thay máu lực lượng, đội tiếp tục khẳng định vị thế của mình trên đấu trường bóng đá phủi Hà Nội.',
  },
];

export const clubHonours: HonourStat[] = [
  { label: 'Danh hiệu', value: '10+' },
  { label: 'Thành viên', value: '50+' },
  { label: 'Cúp Fair Play', value: '+∞' },
  { label: 'Số trận đã đấu', value: '100+' },
];

export const clubRecords: ClubRecord[] = [
  { label: 'Chuỗi bất bại dài nhất', value: '2 tháng', holder: 'Đội bóng từng trải qua chuỗi bất bại dài nhất', note: 'Mùa giải 2024' },
  { label: 'Chuỗi nghỉ dài nhất', value: '3 tháng', holder: 'Đội bóng từng trải qua giai đoạn 3 tháng không hoạt động do thiếu thành viên', note: 'Mùa giải 2025' },
  { label: 'Trận nhậu đậm nhất', value: '24 ca', note: 'Cả đội đã từng uống hết 4tr tiền bia trong 1 lần liên hoan' },
  { label: 'Trận nhậu say nhất', value: '2 người tỉnh', holder: 'Trận nhậu say nhất khi các thành viên vẫn còn là sinh viên, cả đội đều gục ngã chỉ còn 2 thành viên tỉnh táo và dọn dẹp', note: 'Hóme đó điên vl' },
];

// The club's all-time greats — a short, curated list for the ceremonial Hall of Fame section.
export const clubLegends: LegendMember[] = [
  {
    name: 'Đức Thành',
    role: 'Đội trưởng',
    jerseyNumber: 23,
    period: '2018 – nay',
    image: ducThanhPhoto,
    description:
      'Người đội trưởng duy nhất từ khi thành lập đội nhưng cũng là mắt xích yếu nhất của đội, anh nổi tiếng với lối chơi quyết liệt, chắc chắn nhưng thường hay mất kiểm soát blame đồng đội',
  },
  {
    name: 'Ngọc Minh',
    role: 'Đội phó',
    jerseyNumber: 19,
    period: '2018 – nay',
    image: ngocMinhPhoto,
    description:
      'Bộ não của hàng tiền vệ, nổi tiếng với những đường chuyền quyết định và khả năng cầm nhịp trận đấu anh cũng là thủ quỹ kiêm trưởng ban tiếp rượu của đội',
  },
  {
    name: 'Tuấn Anh',
    role: 'Đội phó',
    jerseyNumber: 11,
    period: '2018 – nay',
    image: tuanAnhPhoto,
    description:
    'Từng là nhân tố "Gánh team" trong chiến dịch giành đồng của đội mùa giải 2018, hiện giờ anh lui về đá hậu vệ nhưng đảm bảo đầu ra về mặt tấn công, anh cũng là một trong số các ông bầu giấu mặt của đội'
  },
  {
    name: 'Đức Cris',
    role: 'Tiền đạo',
    jerseyNumber: 9,
    period: '2023 - nay',
    image: ducCrisPhoto,
    description:
    'Người anh lớn và cũng là cây săn bàn hàng đầu, dù ra nhập đội sau nhưng anh liên tục toả sáng và giúp đội vượt qua những trận đấu khó khăn'
  },
  {
    name: 'Quân Hoàng',
    role: 'Giám đốc chuyển nhượng',
    jerseyNumber: 28,
    period: '2023 – 2025',
    image: quanHoangPhoto,
    description:
    'Thi đấu ở vị trí hậu vệ nhưng lại là người quyết định các thương vụ chuyển nhượng của đội, có những thời điểm không có Quân thì đội không có đủ người để đá'
  },
  {
    name: 'Hieu Phan',
    jerseyNumber: 7,
    role: 'Viện trưởng',
    period: '2018 – nay',
    image: hieuPhanPhoto,
    description:
    'Từng là tiền đạo chủ lực của đội, nhưng với chấn thương dây chằng tai quái, anh đã chấm dứt sự nghiệp ở tuổi 24, hiện giờ anh là người quản lý đội và cũng là người thường xuyên tham gia giao lưu cùng đội'
  },
  {
    name: 'Đức Đạt',
    jerseyNumber: 29,
    role: 'Thư ký',
    period: '2018 – nay',
    image: ducDatPhoto,
    description:
    'Một trong những khai quốc công thần, hiện giờ kiêm vai trò thư ký của đội, chịu trách nghiệm thống kê cho đội.'
  },
];

// The full, ever-growing roster of everyone who has ever worn the shirt — separate from the Hall of Fame above.
export const clubAlumni: AlumniMember[] = [
  { name: 'Tấn Minh', role: 'GK đời đầu', period: '2018 – 2020', image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t39.30808-6/578124286_2991777567680547_5220451859989480157_n.jpg?stp=dst-jpg_tt6&cstp=mx1822x2048&ctp=s1822x2048&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHqSTJYoPaXRhw18rLkfCE7QDAyJPTIL_FAMDIk9Mgv8dP7GP69dfBOiYGkcd55NostZw4TJRvS5J77DMaeyD_8&_nc_ohc=gnuuriwuWtoQ7kNvwHjvOAB&_nc_oc=AdrGnF061qQmBQcUbJgo_xV4qOU6oclMluLYWcCp0D3NGrK_fFe5FazXZwESYv3V_VOrCnsK9i6LR6b_2OzzLFev&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_gid=DLRIJOW8YqbNgsVk4OGy1w&_nc_ss=7b2a8&oh=00_AQE2Yqoo5bYn18ocuth6y8idozc4GWOVC7BhfMPbCa8k6Q&oe=6A725CC3" },
  { name: 'Ngọ Việt Hoàng', role: 'Thái tử Thanh hoá - Marcelo', period: '2018 – 2023', image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.6435-9/119710770_2774341222887050_454052986096732459_n.jpg?stp=dst-jpg_tt6&cstp=mx1633x1632&ctp=s1633x1632&_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeFKcgFNP9pz_9nEU9G-nWHNIE79H4osMzsgTv0fiiwzO_8nl41AltQyJTeoa9AeMClPijhoPLXAd_aKloevQ_04&_nc_ohc=kVOUnUGo7xAQ7kNvwElpSyM&_nc_oc=Adp8Xq9uvtUXt-f9iRziIpqR_6qPA-ZB8U6ZSe8dxG01khi8quahuApZ-CY1G78CCcHfCMKrp7XRDwiYMmkTriu2&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_gid=llpsm6Dor3g_if5s0QyKOw&_nc_ss=7b2a8&oh=00_AQHbnxvmdKgRbQysPFuvTmF6Ujfyk6RJa6HAGon0jTPp9g&oe=6A93F8DB" },
  { name: 'Hoàng Đức', role: 'Thi đấu đến dây chằng cuối cùng', period: '2018 – 2021', image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t39.30808-6/590252840_1558023822184869_1174055235347679947_n.jpg?stp=dst-jpg_tt6&cstp=mx2046x2048&ctp=s2046x2048&_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHtaWJaB6udUSwkR3fVf1_M2QZNwrLLlaLZBk3CssuVohYXcoOuYSqmzag8aGNkSk_f8fGoL5xd2Bvr0_dIWP-_&_nc_ohc=8X5KPfIOPN8Q7kNvwGnQfhs&_nc_oc=AdpHRuP85FFOcXuV5qIPZhNuKeIthW-o8rXyQj82RA5_fzQdXMtTjnWnIRJrIkVNHirVCPLvWVgP9dlFCePKjANk&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_gid=QhDyn5PH3MD9AtuJmxehow&_nc_ss=7b2a8&oh=00_AQFAjbSj9bRfuRUBHv0V__veVMcIFdlDmgF5Bq1SCTw2pA&oe=6A724043"  },
  { name: 'Huy Hoàng', role: 'Bet thủ đời đầu', period: '2018 – 2023', image: huyHoangPhoto },
  { name: 'Việt Dũng', role: 'Tiền đạo ngừoi Mê Linh', period: '2018 – 2023', image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t39.30808-6/683039817_4078997625725916_8876190513738644657_n.jpg?stp=dst-jpg_tt6&cstp=mx2032x2048&ctp=s2032x2048&_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGKLatacyAgc3PFN-FX_UkEFR_w-c-7fE0VH_D5z7t8TXX0hQhiyD8Dq-3qNdfQ1ZtzNp1tHaY7U0WjUdzj5HEw&_nc_ohc=GF6PmYDQlD8Q7kNvwFcKAJN&_nc_oc=AdqfQFtju2R4-d0K9om-re0LR7UJJ7iY2HYe6Hgjk91_KSHLiZ2uLvkTnfsdylJ7zV6Xnk8fo8j0wfS4VjyaJY_Q&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_gid=Z99TIzeHIMbtd95RTmeaPg&_nc_ss=7b2a8&oh=00_AQFxw-bEEfh5isBKP44cwfrDctajY54KHaVQQTtz-rDV7Q&oe=6A724A27" },
  { name: 'Đức Long', role: 'Cầu thủ xuất ngoại đầu tiên', period: '2019 – 2024', image: ducLongPhoto },
  { name: 'Việt Anh', role: 'Cầu thủ thi đấu tại Châu Âu đầu tiên', period: '2019 – 2024', image: vietAnhPhoto },
  { name: 'Vũ Đức', role: 'Tiền đạo', period: '2018 – 2023', image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.6435-9/50894933_109168393532666_7006822415632171008_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHUrOClOF7OtppsvE9CDHO-K9qLgNZD6z4r2ouA1kPrPqxgeXkqgRWG1csxdniJb6yOrLsU_HWI5sQrzy2WGH-f&_nc_ohc=cunCMa0BLIYQ7kNvwF5Dgsp&_nc_oc=AdpXn6XBCPMqqNYEGK3tXP0fUaiEalzER2SUjkx1tXnEpEYVy3MOKALXFkr3nWl2fzK_jXw1D_P3DvQxyFU_2ADs&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_gid=GFW4MaPQcP2GhXbyChMTRw&_nc_ss=7b2a8&oh=00_AQECOrUdz-_i2sdP0xYuf15iR2-xuedryQ1hiV09oa1rsA&oe=6A93E30D" },
  { name: 'Khánh Bình', role: 'Nằm trong đội cày thuê Thường Tín', period: '2024', image: khanhBinhPhoto },
  { name: 'Quân Hoàng', role: 'Cựu giám đốc chuyển nhượng', period: '2021 – 2025', image: quanHoangPhoto },
  { name: 'Bá Sơn', role: 'Nằm trong đội cày thuê Thường Tín', period: '2024', image: "https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/435767521_3624588664457500_5165911248386588796_n.jpg?stp=dst-jpg_tt6&cstp=mx959x960&ctp=s959x960&_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGRvIKNVe11j_iiHXLfDG4yfUJHUPgeAh59QkdQ-B4CHkcMW2vLYCd7Xj1jft8OBU90SyMvwfmUuHTTQw19jt5U&_nc_ohc=xt35NPXFff4Q7kNvwEgAprZ&_nc_oc=AdpJxMip442xvt3GhQYWSLZHUVwUoLgLGD6MRdZZ26BcgBv_sQvv6aqeeADZjPeh0yaGT4eFIAEmuHMqsglZ2OwJ&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=GVVpy6CE9OPzpCePG-sDlQ&_nc_ss=7b2a8&oh=00_AQEONgflef7PgieVR2IZg8UX8TFQvUg2UtrfX5BVc5Mx5w&oe=6A726A14" },
  { name: 'Viet Anh Ngo', role: 'Nằm trong đội cày thuê Thường Tín', period: '2024', image: ngoDaiPhoto },
  { name: 'Huy Trung', role: 'Nằm trong đội cày thuê Thường Tín', period: '2024', image: huyTrungPhoto },
  { name: 'Duc Phung', role: 'Du học sinh Vin', period: '2022 – 2025', image: ducPhungPhoto },

];

export const clubJerseys: JerseyEra[] = [
  { year: 2020, label: 'Mẫu áo mùa 2020', image: jersey2020 },
  { year: 2021, label: 'Mẫu áo mùa 2021', image: jersey2021 },
  { year: 2022, label: 'Mẫu áo mùa 2022', image: jersey2022 },
  { year: 2023, label: 'Mẫu áo mùa 2023', image: jersey2023 },
  { year: 2024, label: 'Mẫu áo mùa 2024', image: jersey2024 },
  { year: 2025, label: 'Mẫu áo mùa 2025', image: jersey2025 },
  { year: 2026, label: 'Mẫu áo mùa 2026', image: jersey2026 },
];

export const clubGallery: GalleryPhoto[] = [
  { caption: 'Khai áo 2025', year: 2025, image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t1.15752-9/458685926_1223683078962483_1144812184788108467_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFdeMmtxeZGCJW-wUvPk9hbZrYaymeJeyFmthrKZ4l7IT7XCXOo987h6nDdeavNr62xOJxaxS8pIc_A21ZsbAVi&_nc_ohc=b9AundQ4E1wQ7kNvwFQbV_Z&_nc_oc=Adp7Ca2oBhMtve6q9TgtB7Lut-Lzra7UPDS80KLIhD81kg2ycc6cBMiv_M7vBzBjX1-051OyPGfass3sDxOshRsm&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_ss=7b2a8&oh=03_Q7cD6AGtnwVlHXtayKUL0yZ-CI9Y_aqTgO9rO96uyxgcqB8wyQ&oe=6A93F5B3" },
  { caption: 'Trận derby đáng nhớ', year: 2020, image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.15752-9/461716765_1144092167127138_5861185211574976223_n.png?stp=dst-png&cstp=mx1511x2015&ctp=s1511x2015&_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeF9IGr1o_fqzxgjJq93TWd92puPHADJHCTam48cAMkcJIw0x7Qhpj_2CvMjBw7OiUAR-Nak0efs92_bGdg-C0b8&_nc_ohc=DNCykXVZPzsQ7kNvwHcg53j&_nc_oc=AdqyRl52r2dGvagrxYPmkQ5IozS1xIz-nr6kkpwTgbxq5iLyGB4g3DG50HuKbDic_6MNNNpoI21P-fHMqdtMWqTZ&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_ss=7b2a8&oh=03_Q7cD6AH1LsMfILT2FoyFjgxSqI1IX1pkCsfLyF_ljSUbNAReqA&oe=6A93E4FD" },
  { caption: 'Khai áo 2024', year: 2024, image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.15752-9/462537856_4211533485740442_17585675772405509_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGM_wIvAb9NJDgGDG1PpuZLMuZm0jWKIRcy5mbSNYohF6oAIbm_MxgaiMT6bX2MS9vTuZa5Z7HNnJdfhuoMUC6K&_nc_ohc=UwhHv9BcAL0Q7kNvwEbEt1Y&_nc_oc=AdrcdP418YRxJKfw1lv2ZZVkh0lzrFWP6y0VOL0qYKazRhoUpFGPHO-8PEP3snyPf3ZzpgHGyinwJ7GfUSlw-uw3&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_ss=7b2a8&oh=03_Q7cD6AFDh7b8ABMfzlHhlE3Rqn98wV-3-oqJc7amXEpM1GzSrg&oe=6A93F504" },
  { caption: 'Khai áo 2023', year: 2023, image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t1.15752-9/462534229_553349403818925_3363944235766778189_n.jpg?stp=dst-jpg_tt6&cstp=mx1276x956&ctp=s1276x956&_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEP4UmM_ATI8NuP6oEecf5w8oYxpTtYciLyhjGlO1hyIn80I9Q7SO8CTbi-O432CtzWaEn5jDyF2li07SHWF_Hf&_nc_ohc=qx6WCqrO51AQ7kNvwGb56LH&_nc_oc=AdpM5RBhdmF4gNN01VaTEFAe08YBH_kpapP0tP9ytEJ19XOZVOlUvUgq8sad_cGn2G-PVvJhIaz_lX2WwpLUgIIn&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_ss=7b2a8&oh=03_Q7cD6AGvjjhdMrirtvh51Uene2XiMcF6aGL6XsSBdGqbwufVEQ&oe=6A940297" },
  { caption: 'Giao hữu', year: 2022, image: "https://scontent.fhan5-3.fna.fbcdn.net/v/t1.15752-9/462636540_894783945507219_4165547601904755542_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1535&ctp=s2048x1535&_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeH2jZ8zwWw_6SCOxLBtrxOxaChibNLdgd9oKGJs0t2B36TLTvMWvxOpiuh5mIqwknrEetVxtwgKyeD-QctXQNlo&_nc_ohc=t4NSjl86FvoQ7kNvwFeiG46&_nc_oc=AdpWBW_E9yYa8uNKqNZto5g1CMyICf1M9wOEgGyaKgIPIPW3FEtM-eW9ZEju3HREHDJiKNyH_aIOE5h_mh--pUt0&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_ss=7b2a8&oh=03_Q7cD6AEi8esoonnOtl8c4KHUu1WY4LXgzufR7YQFqCPj_AznoA&oe=6A93F146" },
  { caption: 'Khai xuân', year: 2022, image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.15752-9/462534232_2011131439319889_3260614380866549243_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x960&ctp=s1280x960&_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHS2-24LUv_NtG9T4f9Bw0j3VHBHo-u-jHdUcEej676MbXBqRuHbc26JwV5iC9mcPGVbLR4janNa9CaMr3VKFv0&_nc_ohc=vwIvFTYmNr0Q7kNvwHquzZy&_nc_oc=AdpOLlVs6xr4fYYhBppUebfMe4qPrqS_UfYR3ay-1YzktHF-EEdDwhVR0dnuiMFCnux--gvLk9KuQ1Za8wlwyoDJ&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_ss=7b2a8&oh=03_Q7cD6AE1Vc0G_OxzweITlueyp86m73p6CEC6yZh6fhLIXcBAoA&oe=6A940C8C" },
  { caption: 'Ra quân giải Viện CNTT', year: 2018, image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t1.15752-9/462542031_805307261564895_4924120225209583587_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1370&ctp=s2048x1370&_nc_cat=104&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeElNm2U9XmsxY3a-PhKmVP6UhrfNGOk1TdSGt80Y6TVN1aA3_c0AK_fC3Ku6tUfeRilcpJYYBkYOhchRpO3uE6S&_nc_ohc=TCXspSnYjkcQ7kNvwEGZbQm&_nc_oc=AdpLwcW2kwDV3zyO8trtqbRftreCEtl92YLslJknbJEjMFc1-PuTQpORWjAc5Xu2nbz784dVwlNe4ne9TG8WKSHL&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_ss=7b2a8&oh=03_Q7cD6AHZjikTu50PemtdBZHaZphPyM8GDHcujkpzutt0O8uOvA&oe=6A93FD3A" },
  { caption: "Giao hữu", year: 2026, image: "https://scontent.fhan5-7.fna.fbcdn.net/v/t1.15752-9/688026277_975734721506306_5324569800502456381_n.jpg?stp=dst-jpg_tt6&cstp=mx3072x4096&ctp=s3072x4096&_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGFVQyEHxG4BVLBuiRK-_DsLcgEUX1Ud4UtyARRfVR3hXa6qgxwIaaWyZ-zSQWmvpemHbtu6OCBqaZYlIXcywuE&_nc_ohc=FTfLVH4mQP0Q7kNvwGUzDU_&_nc_oc=Ado2sziHdQNPEytqcg7TCTq3S98WsQobFkJeUgOWTT-3_VXyYWeCk7Rd8uU6YDXZ47oCK_LsFGT71IB_MwrkRbDM&_nc_zt=23&_nc_ht=scontent.fhan5-7.fna&_nc_ss=7b2a8&oh=03_Q7cD6AHkszkktlvEeGyiLZro7J87gFahE4r5XiE1L5no70KeGg&oe=6A9411DE"},
  { caption: "Sinh nhật", year: 2025, image: "https://scontent.fhan5-5.fna.fbcdn.net/v/t1.15752-9/494688221_1822802588287064_6983786924372026103_n.jpg?stp=dst-jpg_tt6&cstp=mx1920x1080&ctp=s1920x1080&_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHXBwsLDkB6i5wWF9pPOh6OACM9J5h_FCYAIz0nmH8UJnGpGwVt-SP23tbZLG7UZP8szO_r_yYnuvHGTgjJ15jj&_nc_ohc=cC-Zi0wD2MUQ7kNvwGS-x5l&_nc_oc=AdpC-53Jgf0i5dwKUBjEKA28NnpULo85jgLmCyi7OumLpc3ssiEgx3P_MB8ORYkZ0t_QHtKmGs7XQX_CsA_MQYWv&_nc_zt=23&_nc_ht=scontent.fhan5-5.fna&_nc_ss=7b2a8&oh=03_Q7cD6AFdAdiy--FP6302JqaXo_F2YwC0XEV_7CixaPuAoyus2g&oe=6A93F459"}
];
