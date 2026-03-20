import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Stack, Divider,
  LinearProgress, CircularProgress,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined,
  PersonOutlined, PhoneOutlined, LocationOnOutlined, CakeOutlined,
  CheckCircleOutline, MedicationOutlined, NotificationsActiveOutlined,
  BarChartOutlined, LocalHospitalOutlined, CelebrationOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { registerASHA } from '../services/auth';

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  purple:      '#2D0A4E',
  purpleMid:   '#4A1272',
  purpleLight: '#6B2FA0',
  roseDark:    '#A0294A',
  rose:        '#C0395B',
  roseLight:   '#E05578',
  pink:        '#F9A8D4',
  bgForm:      '#F8F4FF',
  cardBg:      '#FFFFFF',
  textDark:    '#1A0A2E',
  textMid:     '#5C3A7A',
  textLight:   '#9580AA',
  border:      'rgba(160,41,74,0.14)',
};

/* ─── Field style ───────────────────────────────────────────────────────── */
const fldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#FAFAFA',
    fontSize: '0.93rem',
    '& fieldset': { borderColor: 'rgba(180,180,200,0.5)', borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: C.rose },
    '&.Mui-focused fieldset': { borderColor: C.rose, borderWidth: 2 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.88rem', color: C.textMid },
  '& .MuiInputLabel-root.Mui-focused': { color: C.rose },
};

/* ─── Section label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.8px',
    textTransform: 'uppercase', color: C.textMid, mt: 0.5,
  }}>{children}</Typography>
);

/* ─── Sidebar feature row ────────────────────────────────────────────────── */
const FeatureRow = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
    <Box sx={{
      width: 34, height: 34, flexShrink: 0, borderRadius: '9px',
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.pink,
    }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.83rem', color: 'rgba(243,232,255,0.88)', fontWeight: 400 }}>{text}</Typography>
  </Box>
);

/* ─── District / village data ────────────────────────────────────────────── */
const ALL_DISTRICTS = [
  'Anantapur','Chittoor','East Godavari','Guntur','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa',
  'Anjaw','Changlang','Dibang Valley','East Kameng','East Siang','Kamle','Kra Daadi','Kurung Kumey','Lepa Rada','Lohit','Longding','Lower Dibang Valley','Lower Siang','Lower Subansiri','Namsai','Pakke Kessang','Papum Pare','Shi Yomi','Siang','Tawang','Tirap','Upper Siang','Upper Subansiri','West Kameng','West Siang',
  'Baksa','Barpeta','Biswanath','Bongaigaon','Cachar','Charaideo','Chirang','Darrang','Dhemaji','Dhubri','Dibrugarh','Dima Hasao','Goalpara','Golaghat','Hailakandi','Hojai','Jorhat','Kamrup','Kamrup Metropolitan','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli','Morigaon','Nagaon','Nalbari','Sivasagar','Sonitpur','South Salmara-Mankachar','Tinsukia','Udalguri','West Karbi Anglong',
  'Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran',
  'Balod','Baloda Bazar','Balrampur','Bastar','Bemetara','Bijapur','Bilaspur','Dantewada','Dhamtari','Durg','Gariaband','Gaurela-Pendra-Marwahi','Janjgir-Champa','Jashpur','Kabirdham','Kanker','Kondagaon','Korba','Koriya','Mahasamund','Mungeli','Narayanpur','Raigarh','Raipur','Rajnandgaon','Sukma','Surajpur','Surguja',
  'North Goa','South Goa',
  'Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad',
  'Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar',
  'Bilaspur','Chamba','Hamirpur','Kangra','Kinnaur','Kullu','Lahaul and Spiti','Mandi','Shimla','Sirmaur','Solan','Una',
  'Bokaro','Chatra','Deoghar','Dhanbad','Dumka','East Singhbhum','Garhwa','Giridih','Godda','Gumla','Hazaribagh','Jamtara','Khunti','Koderma','Latehar','Lohardaga','Pakur','Palamu','Ramgarh','Ranchi','Sahebganj','Seraikela Kharsawan','Simdega','West Singhbhum',
  'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir',
  'Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad',
  'Agar Malwa','Alirajpur','Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Niwari','Panna','Raisen','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha',
  'Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal',
  'Bishnupur','Chandel','Churachandpur','Imphal East','Imphal West','Jiribam','Kakching','Kamjong','Kangpokpi','Noney','Pherzawl','Senapati','Tamenglong','Tengnoupal','Thoubal','Ukhrul',
  'East Garo Hills','East Jaintia Hills','East Khasi Hills','Eastern West Khasi Hills','North Garo Hills','Ri Bhoi','South Garo Hills','South West Garo Hills','South West Khasi Hills','West Garo Hills','West Jaintia Hills','West Khasi Hills',
  'Aizawl','Champhai','Hnahthial','Khawzawl','Kolasib','Lawngtlai','Lunglei','Mamit','Saitual','Serchhip',
  'Dimapur','Kiphire','Kohima','Longleng','Mokokchung','Mon','Noklak','Peren','Phek','Tuensang','Wokha','Zunheboto',
  'Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack','Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghpur','Jajpur','Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Kendujhar','Khordha','Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada','Puri','Rayagada','Sambalpur','Subarnapur','Sundargarh',
  'Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Mohali','Muktsar','Nawanshahr','Pathankot','Patiala','Rupnagar','Sangrur','Tarn Taran',
  'Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar','Tonk','Udaipur',
  'East Sikkim','North Sikkim','Pakyong','Soreng','South Sikkim','West Sikkim',
  'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar',
  'Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Kumuram Bheem','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal-Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri',
  'Dhalai','Gomati','Khowai','North Tripura','Sepahijala','Sipahijala','South Tripura','Unakoti','West Tripura',
  'Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi',
  'Almora','Bageshwar','Chamoli','Champawat','Dehradun','Haridwar','Nainital','Pauri Garhwal','Pithoragarh','Rudraprayag','Tehri Garhwal','Udham Singh Nagar','Uttarkashi',
  'Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur',
  'Andaman','Nicobar','Chandigarh','Dadra and Nagar Haveli','Daman','Diu','Lakshadweep','Delhi','Puducherry','Karaikal','Mahe','Yanam','Jammu','Srinagar','Kathua','Udhampur','Rajouri','Poonch','Anantnag','Kulgam','Pulwama','Shopian','Budgam','Ganderbal','Bandipora','Baramulla','Kupwara','Leh','Kargil',
].sort();

const DISTRICT_VILLAGES: Record<string, string[]> = {
  'Lucknow': ['Aliganj','Alambagh','Aminabad','Bakshi Ka Talab','Chinhat','Gomti Nagar','Hazratganj','Indira Nagar','Jankipuram','Kakori','Mahanagar','Malihabad','Mohanlalganj','Sarojini Nagar','Vikas Nagar'],
  'Kanpur Nagar': ['Armapur','Barra','Chakeri','Fazalganj','Govind Nagar','Juhi','Kalyanpur','Kidwai Nagar','Naubasta','Panki','Rawatpur','Shyam Nagar','Vikas Nagar'],
  'Agra': ['Achhnera','Bah','Etmadpur','Fatehabad','Fatehpur Sikri','Jagner','Khandauli','Pinahat','Shamsabad'],
  'Varanasi': ['Arajiline','Chiraigaon','Cholapur','Harahua','Kashi Vidyapeeth','Pindra','Rohania','Sewapuri'],
  'Prayagraj': ['Allahpur','Bara','Chaka','Dhanupur','Handia','Jasra','Karchhana','Koraon','Manda','Phulpur','Pratappur','Shankargarh','Soraon'],
  'Ghaziabad': ['Dasna','Dhaulana','Loni','Modinagar','Muradnagar','Pilkhuwa','Sihani'],
  'Patna': ['Barh','Bikram','Danapur','Fatuha','Khusrupur','Maner','Masaurhi','Mokama','Naubatpur','Paliganj','Phulwari Sharif'],
  'Jaipur': ['Amber','Amer','Bagru','Bassi','Chaksu','Chomu','Dudu','Govindgarh','Kotputli','Phagi','Sambhar','Sanganer','Shahpura'],
  'Jodhpur': ['Balesar','Bap','Bhopalgarh','Bilara','Lohawat','Luni','Mandore','Osian','Phalodi'],
  'Bhopal': ['Berasia','Budhni','Huzur','Ichhawar','Phanda','Sehore'],
  'Indore': ['Depalpur','Hatod','Mhow','Sanwer'],
  'Pune': ['Ambegaon','Baramati','Bhor','Daund','Haveli','Indapur','Junnar','Khed','Maval','Mulshi','Purandar','Shirur'],
  'Nagpur': ['Bhiwapur','Hingna','Kamptee','Katol','Mauda','Narkhed','Parseoni','Ramtek','Savner','Umred'],
  'Mumbai City': ['Colaba','Dharavi','Fort','Kurla','Matunga','Sewri','Wadala'],
  'Mumbai Suburban': ['Andheri','Bandra','Borivali','Dahisar','Ghatkopar','Goregaon','Jogeshwari','Kandivali','Khar','Malad','Mulund','Santacruz'],
  'Bengaluru Urban': ['Anekal','Bangalore East','Bangalore North','Bangalore South','Dasarahalli','Hebbal','Hosakote','Yelahanka','Yeshwanthpur'],
  'Chennai': ['Ambattur','Ayanavaram','Egmore','Kodambakkam','Kolathur','Madhavaram','Manali','Perambur','Royapuram','Sholinganallur'],
  'Ahmedabad': ['Bavla','Daskroi','Dhandhuka','Dholka','Mandal','Sanand','Viramgam'],
  'Kolkata': ['Alipore','Ballygunge','Behala','Belgharia','Dum Dum','Entally','Garden Reach','Jadavpur','Kasba','Maniktala','Shyambazar','Tollygunge'],
  'Delhi': ['Alipur','Bawana','Burari','Deoli','Dwarka','Janakpuri','Karawal Nagar','Mehrauli','Mundka','Najafgarh','Rohini','Sadar Bazar','Shahdara','Uttam Nagar'],
  'Hyderabad': ['Amberpet','Bahadurpura','Charminar','Golconda','Karwan','Khairatabad','Kukatpally','LB Nagar','Malakpet','Malkajgiri','Nampally','Rajendranagar','Secunderabad','Uppal'],
  'Thiruvananthapuram': ['Aruvikkara','Chirayinkeezhu','Kattakada','Kazhakoottam','Kovalam','Nedumangad','Neyyattinkara','Parassala','Varkala'],
  'Ludhiana': ['Dehlon','Jagraon','Khanna','Machhiwara','Payal','Raikot','Samrala'],
  'Gurugram': ['Badshahpur','Farrukhnagar','Manesar','Pataudi','Sohna','Wazirabad'],
};

const getVillages = (d: string) => (DISTRICT_VILLAGES[d] || []).sort();

/* ─── Password strength ──────────────────────────────────────────────────── */
const pwScore = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const SW_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const SW_COLOR = ['#e0e0e0', '#ef4444', '#f97316', '#eab308', '#22c55e'];

/* ═══════════════════════════════════════════════════════════════════════════ */
const OfficerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', district: '',
    village: '', age: '', password: '', confirmPassword: '',
  });
  const [showPw, setShowPw]             = useState(false);
  const [showCPw, setShowCPw]           = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const navigate = useNavigate();

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [f]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!formData.name.trim())                                       return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))         return 'Enter a valid email address';
    if (!/^\d{10}$/.test(formData.phone))                           return 'Enter a valid 10-digit mobile number';
    if (!formData.district)                                          return 'Please select your district';
    if (!formData.village.trim())                                    return 'Village / block is required';
    if (!formData.age || +formData.age < 18 || +formData.age > 60)  return 'Age must be between 18 and 60';
    if (formData.password.length < 8)                               return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password))                           return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(formData.password))                           return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(formData.password))                    return 'Password must contain a special character';
    if (formData.password !== formData.confirmPassword)              return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setIsLoading(true);
    try {
      await registerASHA({
        name: formData.name, phone: `+91${formData.phone}`,
        email: formData.email, password: formData.password,
        age: +formData.age, district: formData.district, village: formData.village,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = pwScore(formData.password);

  /* ── Success screen ── */
  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(155deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        p: 3, fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
      }}>
        <Box sx={{
          p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: '20px',
          maxWidth: 420, width: '100%',
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 24px 60px rgba(45,10,78,0.3)',
          border: '1px solid rgba(192,57,91,0.1)',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(192,57,91,0.12) 0%, rgba(45,10,78,0.08) 100%)',
            border: '2px solid rgba(192,57,91,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2.5,
          }}>
            <CheckCircleOutline sx={{ fontSize: 36, color: C.rose }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: C.purple }}>Registration Successful!</Typography>
            <CelebrationOutlined sx={{ fontSize: '1.3rem', color: C.rose }} />
          </Box>
          <Typography sx={{ color: C.textMid, fontSize: '0.9rem', lineHeight: 1.6, mb: 3 }}>
            Your ASHA Worker account has been created. Redirecting to login…
          </Typography>
          <LinearProgress sx={{
            borderRadius: 4, height: 3,
            bgcolor: 'rgba(192,57,91,0.1)',
            '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${C.roseDark}, ${C.rose})` },
          }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
    }}>

      {/* ════════════════ LEFT SIDEBAR ════════════════ */}
      <Box sx={{
        width: 340,
        display: { xs: 'none', xl: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: '44px 36px',
        background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleMid} 50%, ${C.purpleLight} 100%)`,
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute',
          top: '-80px', right: '-80px',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,57,91,0.2) 0%, transparent 65%)',
        },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 5 }}>
            <Box component="img" src={logo} alt="MaatriSahayak"
              sx={{ width: 54, height: 54, objectFit: 'contain', borderRadius: '12px',
                    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))' }} />
            <Box>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                Maatri<Box component="span" sx={{ color: C.pink }}>Sahayak</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2.2px', color: C.pink, textTransform: 'uppercase', fontWeight: 700 }}>
                Maternal Health Monitoring
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.9rem', color: '#E9D5FF', lineHeight: 1.75, fontStyle: 'italic', mb: 5, opacity: 0.9 }}>
            "Join India's largest network of ASHA workers for better maternal care."
          </Typography>

          {/* Verified badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.8, borderRadius: '8px', mb: 4,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)',
          }}>
            <CheckCircleOutline sx={{ fontSize: 14, color: C.pink }} />
            <Typography sx={{ fontSize: '0.72rem', color: C.pink, fontWeight: 600 }}>Verified Registration Portal</Typography>
          </Box>

          {/* Features */}
          <FeatureRow icon={<MedicationOutlined sx={{ fontSize: 18 }} />} text="Real-time health monitoring" />
          <FeatureRow icon={<NotificationsActiveOutlined sx={{ fontSize: 18 }} />} text="Emergency alert system" />
          <FeatureRow icon={<BarChartOutlined sx={{ fontSize: 18 }} />} text="Data-driven insights" />
          <FeatureRow icon={<LocalHospitalOutlined sx={{ fontSize: 18 }} />} text="NHM government platform" />
        </Box>

        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(249,168,212,0.5)', position: 'relative', zIndex: 1 }}>
          National Health Mission · Government of India
        </Typography>
      </Box>

      {/* ════════════════ RIGHT FORM PANEL ════════════════ */}
      <Box sx={{
        flex: 1, background: C.bgForm,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4, md: 6 },
        position: 'relative',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 70% 20%, rgba(107,47,160,0.06) 0%, transparent 55%)',
          pointerEvents: 'none',
        },
      }}>
        {/* Mobile logo */}
        <Box sx={{ display: { xs: 'flex', xl: 'none' }, flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box component="img" src={logo} alt="MaatriSahayak"
            sx={{ width: 60, height: 60, objectFit: 'contain', borderRadius: '14px', mb: 1.5,
                  filter: 'drop-shadow(0 4px 12px rgba(45,10,78,0.35))' }} />
          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: C.purple }}>
            Maatri<Box component="span" sx={{ color: C.rose }}>Sahayak</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', letterSpacing: '2px', textTransform: 'uppercase', color: C.textMid, fontWeight: 600 }}>
            Maternal Health Monitoring
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{
          width: '100%', maxWidth: 560,
          background: C.cardBg,
          borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 50px rgba(45,10,78,0.1)',
          p: { xs: '28px 22px', sm: '40px 44px' },
          position: 'relative', zIndex: 1,
        }}>
          {/* Card header */}
          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ display: { xs: 'none', xl: 'flex' }, alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box component="img" src={logo} alt="MaatriSahayak"
                sx={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '7px',
                      filter: 'drop-shadow(0 2px 6px rgba(45,10,78,0.3))' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: C.purple }}>MaatriSahayak</Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: '1.6rem', sm: '1.9rem' }, fontWeight: 800, color: C.textDark, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.5 }}>
              Create Account
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: C.textMid }}>
              Register as an <Box component="span" sx={{ color: C.rose, fontWeight: 600 }}>ASHA Worker</Box> · National Health Mission
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '0.88rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>

              {/* ── Personal Information ── */}
              <SectionLabel>Personal Information</SectionLabel>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Full Name" value={formData.name}
                  onChange={set('name')} required disabled={isLoading}
                  placeholder="e.g. Sunita Devi"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={fldSx} />
                <TextField label="Age" type="number" value={formData.age}
                  onChange={set('age')} required disabled={isLoading}
                  inputProps={{ min: 18, max: 60 }} placeholder="18–60"
                  InputProps={{ startAdornment: <InputAdornment position="start"><CakeOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                  sx={{ ...fldSx, width: { xs: '100%', sm: 130 } }} />
              </Stack>

              <TextField fullWidth label="Email Address" type="email" value={formData.email}
                onChange={set('email')} required disabled={isLoading}
                placeholder="you@example.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment> }}
                sx={fldSx} />

              <TextField fullWidth label="Mobile Number" type="tel" value={formData.phone}
                onChange={set('phone')} required disabled={isLoading}
                placeholder="10-digit number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <PhoneOutlined sx={{ color: C.rose, fontSize: 19 }} />
                        <Typography sx={{ fontSize: '0.82rem', color: C.textMid, fontWeight: 600, borderRight: '1px solid #ddd', pr: 0.8 }}>+91</Typography>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={fldSx} />

              {/* ── Location Details ── */}
              <SectionLabel>Location Details</SectionLabel>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Autocomplete fullWidth options={ALL_DISTRICTS} value={formData.district || null}
                  onChange={(_, v) => { setFormData({ ...formData, district: v || '', village: '' }); setError(null); }}
                  disabled={isLoading}
                  renderInput={(p) => (
                    <TextField {...p} label="District" required placeholder="Search district…"
                      InputProps={{
                        ...p.InputProps,
                        startAdornment: <><InputAdornment position="start"><LocationOnOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment>{p.InputProps.startAdornment}</>,
                      }}
                      sx={fldSx} />
                  )} />
                <Autocomplete fullWidth options={getVillages(formData.district)} value={formData.village || null}
                  onChange={(_, v) => { setFormData({ ...formData, village: v || '' }); setError(null); }}
                  disabled={isLoading || !formData.district} freeSolo
                  renderInput={(p) => (
                    <TextField {...p} label="Village / Block" required
                      placeholder={formData.district ? 'Select or type…' : 'Select district first'}
                      InputProps={{
                        ...p.InputProps,
                        startAdornment: <><InputAdornment position="start"><LocationOnOutlined sx={{ color: formData.district ? C.rose : '#b0b0c0', fontSize: 19 }} /></InputAdornment>{p.InputProps.startAdornment}</>,
                      }}
                      sx={fldSx} />
                  )} />
              </Stack>

              {/* ── Account Security ── */}
              <SectionLabel>Account Security</SectionLabel>

              {/* Password + strength */}
              <Box>
                <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'}
                  value={formData.password} onChange={set('password')}
                  required disabled={isLoading}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw(p => !p)} edge="end" disabled={isLoading} size="small">
                          {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fldSx} />
                {formData.password && (
                  <Box sx={{ mt: 1, px: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {[1,2,3,4].map(n => (
                        <Box key={n} sx={{
                          flex: 1, height: 3, borderRadius: 2,
                          bgcolor: n <= strength ? SW_COLOR[strength] : 'rgba(0,0,0,0.08)',
                          transition: 'background-color 0.3s',
                        }} />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: SW_COLOR[strength], fontWeight: 600 }}>
                      {SW_LABEL[strength]} password
                    </Typography>
                  </Box>
                )}
              </Box>

              <TextField fullWidth label="Confirm Password" type={showCPw ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={set('confirmPassword')}
                required disabled={isLoading}
                placeholder="Re-enter your password"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: C.rose, fontSize: 19 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCPw(p => !p)} edge="end" disabled={isLoading} size="small">
                        {showCPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fldSx} />

              {/* Submit */}
              <Button type="submit" fullWidth variant="contained" disabled={isLoading}
                sx={{
                  py: '13px', mt: 0.5,
                  fontSize: '0.95rem', fontWeight: 700,
                  borderRadius: '10px', textTransform: 'none', letterSpacing: 0.3,
                  background: `linear-gradient(135deg, ${C.roseDark} 0%, ${C.rose} 55%, ${C.roseLight} 100%)`,
                  boxShadow: `0 4px 14px rgba(192,57,91,0.4)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #881E3C 0%, ${C.roseDark} 100%)`,
                    boxShadow: `0 8px 22px rgba(192,57,91,0.5)`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { background: '#E9E0F0', color: '#B0A0C0' },
                  transition: 'all 0.25s ease',
                }}>
                {isLoading
                  ? <><CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> Creating Account…</>
                  : 'Create Account →'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3, '&::before,&::after': { borderColor: 'rgba(160,41,74,0.12)' } }}>
            <Typography sx={{ fontSize: '0.78rem', color: C.textLight, px: 1, fontWeight: 500 }}>Already have an account?</Typography>
          </Divider>

          <Button fullWidth variant="outlined"
            onClick={() => navigate('/login')} disabled={isLoading}
            sx={{
              py: '12px', fontSize: '0.93rem', fontWeight: 600,
              borderRadius: '10px', textTransform: 'none',
              borderWidth: 1.5, borderColor: C.purple, color: C.purple,
              '&:hover': { borderColor: C.purpleLight, bgcolor: 'rgba(45,10,78,0.04)', transform: 'translateY(-1px)' },
              transition: 'all 0.25s ease',
            }}>
            Sign In to Your Account
          </Button>

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(160,41,74,0.08)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: C.textLight }}>
              National Health Mission · Government of India © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, fontSize: '0.7rem', color: C.textLight, position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} MaatriSahayak · All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default OfficerRegister;
