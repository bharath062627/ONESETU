import {
  EmergencyHelpline,
  MedicalFacility,
  EmergencyCategoryType,
  EmergencyRoutingInfo,
  AiEmergencyResponse,
  EmergencyUrgencyClass
} from '../types';

// ==========================================
// 1. VERIFIED HELPLINE DATABASE (CENTRALIZED)
// ==========================================

export const INITIAL_VERIFIED_HELPLINES: EmergencyHelpline[] = [
  {
    id: 'hl-112',
    service_name: 'India Unified Emergency Helpline (ERSS)',
    category: 'Police',
    number: '112',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'National single emergency response number for Police, Fire, Ambulance and Disaster support under Emergency Response Support System (ERSS).',
    source: 'Ministry of Home Affairs (MHA), Government of India',
    source_url: 'https://112.gov.in',
    verified_at: '2026-09-20',
    effective_from: '2019-02-19',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / Verified Health Board',
    updated_at: '2026-09-20',
    notes: 'Primary national emergency number. Call immediately for all life-threatening emergencies.',
    enabled: true
  },
  {
    id: 'hl-108',
    service_name: 'Arogyakavacha Emergency Medical & Ambulance Service',
    category: 'Ambulance',
    number: '108',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Comprehensive 24x7 emergency medical, trauma, obstetric, and disaster ambulance dispatch service operated across Karnataka.',
    source: 'Department of Health & Family Welfare, Govt of Karnataka / GVK-EMRI',
    source_url: 'https://hfw.karnataka.gov.in',
    verified_at: '2026-09-22',
    effective_from: '2008-11-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / Medical Registry',
    updated_at: '2026-09-22',
    notes: 'State emergency medical response service with GPS-tracked ALS and BLS ambulances.',
    enabled: true
  },
  {
    id: 'hl-102',
    service_name: 'Janani Shishu Suraksha Karyakram (JSSK) Ambulance',
    category: 'Ambulance',
    number: '102',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Free patient transport ambulance service dedicated to pregnant mothers for institutional deliveries and sick newborns up to 1 year.',
    source: 'National Health Mission (NHM) / Govt of Karnataka',
    source_url: 'https://nhm.gov.in',
    verified_at: '2026-09-18',
    effective_from: '2011-06-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / NHM Audit',
    updated_at: '2026-09-18',
    notes: 'Specialized for maternity transport, labor emergencies, and neonatal medical transfers.',
    enabled: true
  },
  {
    id: 'hl-104',
    service_name: 'Arogyavani Karnataka Health Information Helpline',
    category: 'Hospital',
    number: '104',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Government medical advice helpline providing non-emergency health guidance, epidemic alerts, hospital beds information, and doctor tele-consult.',
    source: 'Department of Health & Family Welfare, Govt of Karnataka',
    source_url: 'https://karnataka.gov.in',
    verified_at: '2026-09-15',
    effective_from: '2013-06-22',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / HFW Dept',
    updated_at: '2026-09-15',
    notes: 'Verified for medical advice and hospital grievance. For trauma or critical emergencies dial 112 or 108.',
    enabled: true
  },
  {
    id: 'hl-181',
    service_name: 'National Women Helpline (Domestic Abuse & Crisis)',
    category: 'Women',
    number: '181',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'Toll-free 24-hour telephonic service providing emergency response, rescue, medical aid coordination, and legal counseling for women in distress.',
    source: 'Ministry of Women and Child Development, Govt of India',
    source_url: 'https://wcd.nic.in',
    verified_at: '2026-09-10',
    effective_from: '2015-04-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / MWCD',
    updated_at: '2026-09-10',
    notes: 'Direct linkage to One Stop Centres (Sakhi) and Police emergency response.',
    enabled: true
  },
  {
    id: 'hl-100',
    service_name: 'Karnataka Police Control Room',
    category: 'Police',
    number: '100',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Immediate police patrol vehicle dispatch and crime emergency reporting control room.',
    source: 'Karnataka State Police Headquarters',
    source_url: 'https://ksp.karnataka.gov.in',
    verified_at: '2026-09-12',
    effective_from: '1970-01-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / KSP Desk',
    updated_at: '2026-09-12',
    notes: 'Routing is automatically bridged to 112 in districts where unified dispatch is deployed.',
    enabled: true
  },
  {
    id: 'hl-101',
    service_name: 'Karnataka Fire & Emergency Services',
    category: 'Fire',
    number: '101',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Disaster mitigation, building fires, chemical accidents, and rescue operations dispatch.',
    source: 'Karnataka Fire and Emergency Services Dept',
    source_url: 'https://ksp.karnataka.gov.in/fire',
    verified_at: '2026-09-14',
    effective_from: '1970-01-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / KFES',
    updated_at: '2026-09-14',
    notes: 'Can also be reached via 112 unified emergency dispatch.',
    enabled: true
  },
  {
    id: 'hl-1098',
    service_name: 'Childline India / Mission Vatsalya Helpline',
    category: 'Child',
    number: '1098',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'Emergency assistance, rescue, protection, medical care, and shelter for children in distress or facing abuse.',
    source: 'Ministry of Women and Child Development (MWCD), Govt of India',
    source_url: 'https://childlineindia.org',
    verified_at: '2026-09-11',
    effective_from: '1996-06-20',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / Childline Board',
    updated_at: '2026-09-11',
    notes: 'Integrates with district child welfare committees and emergency medical pediatric units.',
    enabled: true
  },
  {
    id: 'hl-1930',
    service_name: 'National Cyber Crime Reporting Helpline',
    category: 'Cyber Crime',
    number: '1930',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'Immediate financial cyber fraud freeze and online harassment reporting operated by Indian Cyber Crime Coordination Centre (I4C).',
    source: 'Ministry of Home Affairs / I4C',
    source_url: 'https://cybercrime.gov.in',
    verified_at: '2026-09-08',
    effective_from: '2021-04-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / MHA Desk',
    updated_at: '2026-09-08',
    notes: 'Call within golden hour of unauthorized bank or UPI transaction to freeze funds.',
    enabled: true
  },
  {
    id: 'hl-14416',
    service_name: 'Tele-MANAS National Mental Health Helpline',
    category: 'Mental Health',
    number: '14416',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'National tele-mental health assistance program coordinated by NIMHANS Bengaluru providing immediate psychological first aid, suicide crisis intervention, and psychiatric counseling.',
    source: 'National Institute of Mental Health and Neuro-Sciences (NIMHANS) & MoHFW',
    source_url: 'https://telemanas.mohfw.gov.in',
    verified_at: '2026-09-24',
    effective_from: '2022-10-10',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / NIMHANS Cell',
    updated_at: '2026-09-24',
    notes: 'Toll-free short code 14416 or alternate toll-free 1800-89-14416. Multi-lingual support in 20+ Indian languages.',
    enabled: true
  },
  {
    id: 'hl-1800116117',
    service_name: 'National Poisons Information Centre (NPIC AIIMS)',
    category: 'Poison',
    number: '1800-116-117',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'Specialized 24x7 emergency toxicology guidance on accidental poisoning, chemical ingestion, pesticides, household toxins, and antivenom protocols.',
    source: 'Department of Pharmacology, All India Institute of Medical Sciences (AIIMS New Delhi)',
    source_url: 'https://www.aiims.edu',
    verified_at: '2026-09-21',
    effective_from: '1995-04-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / AIIMS NPIC Registry',
    updated_at: '2026-09-21',
    notes: 'Do not induce vomiting or administer home remedies before consulting NPIC or emergency doctor.',
    enabled: true
  },
  {
    id: 'hl-1070',
    service_name: 'State Disaster Management Control Room',
    category: 'Disaster',
    number: '1070',
    country: 'India',
    state: 'Karnataka',
    city: 'Statewide',
    scope: 'STATE',
    availability: '24x7 Toll Free',
    description: 'Karnataka State Disaster Management Authority (KSDMA) emergency helpline for floods, landslides, extreme weather, and rescue coordination.',
    source: 'Karnataka State Disaster Management Authority / Revenue Dept',
    source_url: 'https://ksdma.karnataka.gov.in',
    verified_at: '2026-09-05',
    effective_from: '2010-01-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / KSDMA',
    updated_at: '2026-09-05',
    notes: 'District-level disaster control is reachable at 1077 in respective deputy commissioner offices.',
    enabled: true
  },
  {
    id: 'hl-1073',
    service_name: 'National Highway Road Accident Helpline',
    category: 'Road Accident',
    number: '1073',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Highways',
    scope: 'NATIONAL',
    availability: '24x7 Toll Free',
    description: 'Emergency highway ambulance, vehicular rescue, and crane assistance on National Highways across India.',
    source: 'Ministry of Road Transport and Highways (MoRTH) / NHAI',
    source_url: 'https://morth.nic.in',
    verified_at: '2026-09-09',
    effective_from: '2013-03-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / NHAI Desk',
    updated_at: '2026-09-09',
    notes: 'Covers National Highways corridor emergency medical response.',
    enabled: true
  },
  {
    id: 'hl-14567',
    service_name: 'Elderline — National Senior Citizen Helpline',
    category: 'Other',
    number: '14567',
    country: 'India',
    state: 'All States & UTs',
    city: 'All Cities',
    scope: 'NATIONAL',
    availability: '8:00 AM - 8:00 PM Daily',
    description: 'Toll-free helpline providing elder abuse intervention, rescue of abandoned senior citizens, emotional support, and legal guidance.',
    source: 'Ministry of Social Justice and Empowerment / NISD',
    source_url: 'https://elderline.dosje.gov.in',
    verified_at: '2026-09-12',
    effective_from: '2021-10-01',
    verification_status: 'VERIFIED',
    last_checked_by: 'Admin / NISD Cell',
    updated_at: '2026-09-12',
    notes: 'Dedicated to elderly support and emergency medical rescue coordination.',
    enabled: true
  }
];

// Minimal Offline Emergency Directory (Mandatory Offline Fallback)
export const OFFLINE_EMERGENCY_DIRECTORY = [
  { service: 'Unified Emergency (Police / Fire / Medical)', number: '112', scope: 'India Unified' },
  { service: 'Emergency Ambulance / Trauma', number: '108', scope: 'Karnataka 24x7' },
  { service: 'Maternity & Child Transport', number: '102', scope: 'Karnataka 24x7' },
  { service: 'Health Information & Medical Advice', number: '104', scope: 'Karnataka 24x7' },
  { service: 'National Poisons Info (NPIC AIIMS)', number: '1800-116-117', scope: 'National 24x7' },
  { service: 'Tele-MANAS Mental Health Support', number: '14416', scope: 'National 24x7' },
  { service: 'Women Helpline', number: '181', scope: 'National 24x7' },
  { service: 'Child Helpline', number: '1098', scope: 'National 24x7' }
];

// ==========================================
// 2. VERIFIED MEDICAL FACILITIES DATABASE
// ==========================================

export const INITIAL_VERIFIED_FACILITIES: MedicalFacility[] = [
  {
    id: 'fac-kr-hosp',
    name: 'Mysuru District Hospital (K.R. Hospital & MMCRI)',
    type: 'Hospital',
    address: 'Irwin Road, Near Mysuru City Railway Station, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    phone: '0821-2520512',
    altPhone: '0821-2520513',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Emergency & Casualty',
    specialties: [
      'Emergency Medicine',
      'Trauma Care',
      'Cardiology',
      'Neurology',
      'General Medicine',
      'General Surgery',
      'Orthopedics',
      'Pediatrics',
      'Maternity',
      'Blood Bank',
      'Poison Management',
      'Burns Unit',
      'ICU'
    ],
    distanceKm: 1.8,
    latitude: 12.3168,
    longitude: 76.6508,
    source: 'Mysore Medical College & Research Institute (MMCRI), Govt of Karnataka',
    sourceUrl: 'https://mmcrimysore.in',
    verifiedAt: '2026-09-20',
    verificationStatus: 'VERIFIED',
    notes: 'Apex government tertiary hospital in Mysuru with 1050 beds and full casualty department.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-apollo-bgs',
    name: 'Apollo BGS Hospitals Mysuru',
    type: 'Hospital',
    address: 'Adichunchanagiri Road, Kuvempunagar, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570023',
    phone: '0821-2568888',
    altPhone: '1066',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Emergency & Critical Care',
    specialties: [
      'Emergency Department',
      'Cardiology',
      'Interventional Cardiology',
      'Stroke Center',
      'Neurology',
      'Neurosurgery',
      'Polytrauma',
      'Cardiac Emergency',
      'Pediatrics',
      'Maternity',
      'Blood Bank',
      'Critical Care ICU'
    ],
    distanceKm: 3.4,
    latitude: 12.2922,
    longitude: 76.6346,
    source: 'NABH Accredited Hospital Directory & Apollo Emergency Network',
    sourceUrl: 'https://mysore.apollohospitals.com',
    verifiedAt: '2026-09-22',
    verificationStatus: 'VERIFIED',
    notes: 'Comprehensive 24/7 Stroke Unit, Acute Chest Pain Center and Cath Lab.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-jss-hospital',
    name: 'JSS Hospital & Medical College',
    type: 'Hospital',
    address: 'MG Road, Agrahara, Fort Mohalla, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570004',
    phone: '0821-2335555',
    altPhone: '0821-2335112',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Level-1 Trauma & Emergency',
    specialties: [
      'Emergency Department',
      'Trauma Care',
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Pediatric ICU (PICU)',
      'Neonatal ICU (NICU)',
      'Maternity',
      'Obstetrics',
      'Poison Management',
      'Toxicology ICU',
      'Burns Unit',
      'Blood Bank',
      'Dialysis',
      'Psychiatry'
    ],
    distanceKm: 3.9,
    latitude: 12.2985,
    longitude: 76.6572,
    source: 'JSS Mahavidyapeetha Medical Directorate / NABH Registered',
    sourceUrl: 'https://jsshospital.in',
    verifiedAt: '2026-09-24',
    verificationStatus: 'VERIFIED',
    notes: '1800-bed multi-specialty facility equipped with dedicated pediatric emergency and poisoning care unit.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-cauvery-heart',
    name: 'Cauvery Heart & Multi-Speciality Hospital',
    type: 'Hospital',
    address: 'Siddhartha Layout, Bannur Road, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570011',
    phone: '0821-2477777',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Cardiac Emergency',
    specialties: [
      'Cardiology',
      'Heart Emergency',
      'Emergency Department',
      'Cardiac Care Unit (CCU)',
      'Emergency Surgery',
      'Dialysis',
      'General Medicine',
      'Blood Bank',
      'Ambulance'
    ],
    distanceKm: 4.8,
    latitude: 12.3041,
    longitude: 76.6892,
    source: 'Karnataka State Health Facilities Portal',
    sourceUrl: 'https://cauveryhospitalmysore.com',
    verifiedAt: '2026-09-18',
    verificationStatus: 'VERIFIED',
    notes: 'Specialized cardiac emergency unit with 24x7 digital catheterization lab.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-cheluvamba',
    name: 'Cheluvamba Hospital for Women and Children (Govt Maternity)',
    type: 'Hospital',
    address: 'Irwin Road, Medar Block, Yadavagiri, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    phone: '0821-2520513',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Obstetric & Pediatric Emergency',
    specialties: [
      'Maternity',
      'Pregnancy Emergency',
      'High-Risk Obstetrics',
      'Labor Room',
      'Pediatrics',
      'Child Emergency',
      'Neonatal Intensive Care (NICU)',
      'Gynecology',
      'Emergency Department',
      'Blood Bank'
    ],
    distanceKm: 2.0,
    latitude: 12.3175,
    longitude: 76.6495,
    source: 'Department of Medical Education & MMCRI, Govt of Karnataka',
    sourceUrl: 'https://mmcrimysore.in/cheluvamba',
    verifiedAt: '2026-09-23',
    verificationStatus: 'VERIFIED',
    notes: 'Historic government mother & child tertiary hospital with 420 maternity beds and specialized neonatal ICU.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-jayadeva',
    name: 'Sri Jayadeva Institute of Cardiovascular Sciences and Research',
    type: 'Hospital',
    address: 'KRS Road, PKTB Sanatorium Campus, Mysuru Branch',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570016',
    phone: '0821-2572222',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours Acute Coronary Emergency',
    specialties: [
      'Cardiology',
      'Heart Emergency',
      'Heart Hospital',
      'Interventional Cardiology',
      'Emergency Department',
      'Cardiac ICU',
      'Cardiac Surgery',
      'Echo & Angiography'
    ],
    distanceKm: 4.2,
    latitude: 12.3392,
    longitude: 76.6214,
    source: 'Govt of Karnataka Autonomous Super-Speciality Institute',
    sourceUrl: 'https://jayadevacardiology.com',
    verifiedAt: '2026-09-19',
    verificationStatus: 'VERIFIED',
    notes: 'State-of-the-art autonomous heart care hospital offering 24/7 acute coronary emergency intervention.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-ayush-clinic',
    name: 'Government Ayurvedic Research Hospital & Clinic',
    type: 'Clinic',
    address: 'Sayyaji Rao Road, Near Government Medical College, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    phone: '0821-2443026',
    hasEmergencyDepartment: false,
    is24x7: false,
    openingHours: '8:30 AM - 1:30 PM & 3:30 PM - 5:30 PM',
    specialties: [
      'General Medicine',
      'Clinic',
      'Outpatient Consultation',
      'Dermatology',
      'Arthritis & Joint Care',
      'Panchakarma',
      'Chronic Care'
    ],
    distanceKm: 1.4,
    latitude: 12.3142,
    longitude: 76.6521,
    source: 'Department of AYUSH, Government of Karnataka',
    sourceUrl: 'https://ayush.karnataka.gov.in',
    verifiedAt: '2026-09-15',
    verificationStatus: 'VERIFIED',
    notes: 'Outpatient clinic and wellness center. For medical emergencies, use K.R. Hospital across the street.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-medplus-24x7',
    name: 'MedPlus 24x7 Emergency Pharmacy',
    type: 'Pharmacy',
    address: 'Saraswathipuram Main Road, Near Fire Brigade, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570009',
    phone: '0821-2411234',
    altPhone: '9845012345',
    hasEmergencyDepartment: false,
    is24x7: true,
    openingHours: '24 Hours Open (365 Days)',
    specialties: [
      'Pharmacy',
      '24 Hour Pharmacy',
      'Life Saving Drugs',
      'Refrigerated Insulin',
      'Antivenom & Injections',
      'Pediatric Medicines',
      'First Aid Kits',
      'Surgical Supplies',
      'Nebulizers & Oxygen Cans'
    ],
    distanceKm: 1.5,
    latitude: 12.3021,
    longitude: 76.6389,
    source: 'Karnataka State Drugs Control Department License Reg. #KD-7729',
    sourceUrl: 'https://www.medplusindia.com',
    verifiedAt: '2026-09-24',
    verificationStatus: 'VERIFIED',
    notes: 'Verified 24/7 all-night counter with stock of emergency prescription medicines and snake antivenom.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-apollo-pharmacy',
    name: 'Apollo Pharmacy 24/7 Kalidasa Road',
    type: 'Pharmacy',
    address: 'Kalidasa Road, V.V. Mohalla, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570002',
    phone: '0821-2410500',
    hasEmergencyDepartment: false,
    is24x7: true,
    openingHours: '24 Hours Open Daily',
    specialties: [
      'Pharmacy',
      '24 Hour Pharmacy',
      'Emergency Prescription Drugs',
      'Cardiology Medicines',
      'Pediatrics Formulations',
      'Diagnostic Test Strips',
      'First Aid Kits'
    ],
    distanceKm: 2.6,
    latitude: 12.3211,
    longitude: 76.6315,
    source: 'Karnataka State Pharmacy Council Registered Dispensary #AS-819',
    sourceUrl: 'https://www.apollopharmacy.in',
    verifiedAt: '2026-09-21',
    verificationStatus: 'VERIFIED',
    notes: 'Verified 24-hour retail chemist counter with temperature-controlled pharmaceutical storage.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-redcross-blood',
    name: 'Indian Red Cross Society Voluntary Blood Centre',
    type: 'Blood Bank',
    address: 'Sayyaji Rao Road, Near Suburb Bus Stand, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    phone: '0821-2514455',
    altPhone: '9448055444',
    hasEmergencyDepartment: false,
    is24x7: true,
    openingHours: '24 Hours Emergency Blood Issue',
    specialties: [
      'Blood Bank',
      'Emergency Blood Supply',
      'Packed Red Blood Cells (PRBC)',
      'Fresh Frozen Plasma (FFP)',
      'Single Donor Platelets (SDP)',
      'Random Donor Platelets (RDP)',
      'Cryoprecipitate',
      'Voluntary Blood Donation'
    ],
    distanceKm: 2.7,
    latitude: 12.3088,
    longitude: 76.6548,
    source: 'State Blood Transfusion Council (SBTC) Karnataka',
    sourceUrl: 'https://redcrosskarnataka.org',
    verifiedAt: '2026-09-22',
    verificationStatus: 'VERIFIED',
    notes: '24/7 government-authorized blood separation and emergency issuing center.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-jeevaraksha-amb',
    name: 'Jeevaraksha Emergency Ambulance Network',
    type: 'Ambulance',
    address: 'Hunsur Main Road, Paduvaralli, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570006',
    phone: '0821-2401080',
    altPhone: '9900010800',
    hasEmergencyDepartment: false,
    is24x7: true,
    openingHours: '24x7 Immediate Dispatch',
    specialties: [
      'Ambulance',
      'Advanced Life Support (ALS)',
      'Basic Life Support (BLS)',
      'Ventilator Ambulance',
      'Cardiac Monitor & Defibrillator',
      'Trauma Stabilization',
      'Inter-Hospital Patient Transfer',
      'Oxygen Support'
    ],
    distanceKm: 2.3,
    latitude: 12.3114,
    longitude: 76.6288,
    source: 'Mysuru Emergency Transport Registry & District Health Society',
    sourceUrl: 'https://mysuru.nic.in/health',
    verifiedAt: '2026-09-23',
    verificationStatus: 'VERIFIED',
    notes: 'Fleet of 8 GPS-enabled ALS and BLS ambulances staffed with emergency medical technicians.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-city-diagnostics',
    name: 'City Diagnostics & Emergency Imaging Center',
    type: 'Diagnostic Center',
    address: 'Ramaswamy Circle, Chamaraja Mohalla, Mysuru',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    pincode: '570024',
    phone: '0821-2422111',
    hasEmergencyDepartment: false,
    is24x7: true,
    openingHours: '24x7 Emergency CT & Pathology',
    specialties: [
      'Diagnostic Center',
      'Emergency CT Scan',
      'Digital X-Ray',
      'Ultrasonography',
      'Emergency Blood Pathology',
      'ECG 12-Lead',
      'Cardiac Biomarkers (Troponin-I)',
      'ABG Analysis'
    ],
    distanceKm: 2.1,
    latitude: 12.3055,
    longitude: 76.6432,
    source: 'NABL Accredited Diagnostic Laboratories Registry',
    sourceUrl: 'https://nabl-india.org',
    verifiedAt: '2026-09-17',
    verificationStatus: 'VERIFIED',
    notes: 'Round-the-clock rapid diagnostic reports for trauma, stroke, and cardiac biomarkers.',
    enabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80'
  }
];

// ==========================================
// 3. EMERGENCY TYPE ROUTING CONFIGURATION
// ==========================================

export const EMERGENCY_ROUTING_REGISTRY: Record<EmergencyCategoryType, EmergencyRoutingInfo> = {
  HEART_CHEST_PAIN: {
    category: 'HEART_CHEST_PAIN',
    label: 'Heart / Chest Pain',
    icon: '❤️',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Arogyakavacha Ambulance (Trauma & Cardiac)',
    specializedNumber: '108',
    guidance: 'Have the person sit down and rest calmly. Loosen tight clothing. Do not give food or drink. Call emergency ambulance immediately.',
    relevantSpecialties: ['Cardiology', 'Heart Emergency', 'Emergency Department', 'Cardiac Care Unit (CCU)']
  },
  PREGNANCY_MATERNITY: {
    category: 'PREGNANCY_MATERNITY',
    label: 'Pregnancy / Maternity Emergency',
    icon: '🤰',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 / 102 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Janani Shishu Suraksha Karyakram (JSSK)',
    specializedNumber: '102',
    guidance: 'Have the pregnant person lie on their left side. Keep warm and calm. If heavy bleeding, fluid leakage or severe labor pain occurs, dispatch ambulance immediately.',
    relevantSpecialties: ['Maternity', 'Pregnancy Emergency', 'High-Risk Obstetrics', 'Obstetrics', 'Pediatrics']
  },
  STROKE_NEURO: {
    category: 'STROKE_NEURO',
    label: 'Stroke / Sudden Weakness / Speech Loss',
    icon: '🧠',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Comprehensive Stroke Emergency Center',
    specializedNumber: '108',
    guidance: 'Check FAST: Face drooping? Arm weakness? Speech slurred? Time to call emergency. Note the exact time symptoms started. Keep patient lying down.',
    relevantSpecialties: ['Stroke Center', 'Neurology', 'Neurosurgery', 'Emergency Department']
  },
  BREATHING_DIFFICULTY: {
    category: 'BREATHING_DIFFICULTY',
    label: 'Breathing Difficulty / Severe Asthma / Choking',
    icon: '🫁',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Emergency Oxygen & Resuscitation',
    specializedNumber: '108',
    guidance: 'Help person sit upright in comfortable position. Loosen collar and tight belts. Ensure fresh air. If choking and responsive, give back blows/abdominal thrusts if trained.',
    relevantSpecialties: ['Emergency Medicine', 'Emergency Department', 'ICU', 'Critical Care ICU']
  },
  ACCIDENT_TRAUMA: {
    category: 'ACCIDENT_TRAUMA',
    label: 'Accident / Severe Injury / Vehicle Crash',
    icon: '🚑',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Highway Accident Helpline (NHAI)',
    specializedNumber: '1073',
    guidance: 'Do not move injured person unless immediate danger of fire or explosion. Stabilize neck and spine. Apply clean pressure to visible bleeding.',
    relevantSpecialties: ['Trauma Care', 'Emergency Department', 'Polytrauma', 'Orthopedics', 'General Surgery']
  },
  SEVERE_BLEEDING: {
    category: 'SEVERE_BLEEDING',
    label: 'Severe Bleeding / Deep Wound',
    icon: '🩸',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Emergency Blood Bank',
    specializedNumber: '0821-2514455',
    guidance: 'Apply firm, continuous direct pressure with a clean cloth or sterile gauze. Do not remove objects embedded deeply. Keep person lying down with legs elevated.',
    relevantSpecialties: ['Emergency Department', 'Trauma Care', 'Blood Bank', 'General Surgery']
  },
  CHILD_EMERGENCY: {
    category: 'CHILD_EMERGENCY',
    label: 'Child Emergency / High Fever / Seizure in Infant',
    icon: '🧒',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Childline India (Mission Vatsalya)',
    specializedNumber: '1098',
    guidance: 'Keep infant or child calm. If struggling to breathe or unresponsive, dial 112/108 immediately. Keep airways clear. Do not administer aspirin to children.',
    relevantSpecialties: ['Pediatrics', 'Child Emergency', 'Pediatric ICU (PICU)', 'Neonatal Intensive Care (NICU)']
  },
  POISONING: {
    category: 'POISONING',
    label: 'Poisoning / Chemical Ingestion / Overdose',
    icon: '☠️',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 1800-116-117 NPIC AIIMS',
    secondaryNumber: '1800-116-117',
    specializedService: 'National Poisons Information Centre (AIIMS New Delhi)',
    specializedNumber: '1800-116-117',
    guidance: 'DO NOT induce vomiting unless instructed by medical professionals. Keep the container or chemical label ready. Call National Poisons Info immediately or reach nearest emergency ICU.',
    relevantSpecialties: ['Poison Management', 'Toxicology ICU', 'Emergency Department', 'ICU']
  },
  BURNS_FIRE: {
    category: 'BURNS_FIRE',
    label: 'Severe Burns / Fire / Scalds',
    icon: '🔥',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 101 FIRE / 108 AMBULANCE',
    secondaryNumber: '101',
    specializedService: 'Karnataka Fire & Emergency Services',
    specializedNumber: '101',
    guidance: 'Cool burn area immediately under gentle cool running tap water for 10-20 minutes. Do not apply ice, butter, or oil. Cover loosely with sterile clean plastic wrap or cloth.',
    relevantSpecialties: ['Burns Unit', 'Emergency Department', 'General Surgery', 'ICU']
  },
  UNCONSCIOUS_FAINTING: {
    category: 'UNCONSCIOUS_FAINTING',
    label: 'Unconscious / Fainting / Unresponsive',
    icon: '😵',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Arogyakavacha Emergency Resuscitation',
    specializedNumber: '108',
    guidance: 'Check if person responds to voice or shoulder tap. If breathing, place in recovery position (on side). If not breathing, start chest compressions (CPR) if trained and call 112.',
    relevantSpecialties: ['Emergency Department', 'Trauma Care', 'Critical Care ICU', 'Neurology']
  },
  SEIZURE: {
    category: 'SEIZURE',
    label: 'Seizure / Convulsions / Fitting',
    icon: '⚡',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Emergency Neurological ICU',
    specializedNumber: '108',
    guidance: 'Protect from injury: move sharp objects away. Cushion head with soft folded cloth. Do NOT hold person down or force anything into mouth. Time the seizure.',
    relevantSpecialties: ['Neurology', 'Emergency Department', 'Pediatrics', 'ICU']
  },
  MENTAL_HEALTH: {
    category: 'MENTAL_HEALTH',
    label: 'Mental Health Crisis / Suicide Prevention / Severe Distress',
    icon: '🧠',
    primaryAction: 'CALL 14416 TELE-MANAS',
    primaryNumber: '14416',
    secondaryAction: 'CALL 112 (IMMEDIATE DANGER)',
    secondaryNumber: '112',
    specializedService: 'Tele-MANAS National Mental Health (NIMHANS)',
    specializedNumber: '1800-89-14416',
    guidance: 'You are not alone. Free, confidential 24/7 mental health support is available right now. If there is immediate physical danger or self-harm, call 112 immediately.',
    relevantSpecialties: ['Psychiatry', 'Mental Health', 'Emergency Department']
  },
  ANIMAL_SNAKE_BITE: {
    category: 'ANIMAL_SNAKE_BITE',
    label: 'Snake Bite / Scorpion Sting / Animal Bite',
    icon: '🐍',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'National Poisons Info (NPIC)',
    specializedNumber: '1800-116-117',
    guidance: 'Keep bitten limb completely immobilized and below heart level. Keep patient calm and still. Do NOT cut the wound, suck venom, or apply a tight tourniquet. Rush to nearest emergency hospital with antivenom.',
    relevantSpecialties: ['Emergency Department', 'Poison Management', 'Trauma Care', 'ICU']
  },
  ALL_OTHER: {
    category: 'ALL_OTHER',
    label: 'General Medical Emergency / Urgent Health Needs',
    icon: '🚨',
    primaryAction: 'CALL 112',
    primaryNumber: '112',
    secondaryAction: 'CALL 108 AMBULANCE',
    secondaryNumber: '108',
    specializedService: 'Arogyavani Health Advice (Karnataka)',
    specializedNumber: '104',
    guidance: 'If this is a sudden, severe, or worsening condition, contact emergency medical help immediately. Do not delay emergency care.',
    relevantSpecialties: ['Emergency Department', 'General Medicine', 'Hospital']
  }
};

// ==========================================
// 4. PHONE NUMBER FORMAT VALIDATOR
// ==========================================

export function validateIndianPhoneNumber(rawNumber: string): {
  isValid: boolean;
  normalized: string;
  type: string;
  error?: string;
} {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return { isValid: false, normalized: '', type: 'UNKNOWN', error: 'Phone number is required' };
  }

  const cleaned = rawNumber.trim().replace(/[\s\-\(\)\.]/g, '');

  // 1. National short emergency codes (3, 4, 5 digits)
  // 112, 108, 102, 104, 181, 100, 101, 1098, 1930, 1070, 1073, 1077, 14416, 14567, 1066
  if (/^\d{3,5}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned, type: 'EMERGENCY_SHORT_CODE' };
  }

  // 2. Indian Toll Free: 1800-xxx-xxxx (10-11 digits starting with 1800)
  if (/^1800\d{6,7}$/.test(cleaned)) {
    return { isValid: true, normalized: cleaned, type: 'TOLL_FREE' };
  }

  // 3. Indian Mobile: 10 digits starting with 6, 7, 8, 9, or +91 / 0 prefix
  let mobileDigits = cleaned;
  if (mobileDigits.startsWith('+91')) {
    mobileDigits = mobileDigits.slice(3);
  } else if (mobileDigits.startsWith('91') && mobileDigits.length === 12) {
    mobileDigits = mobileDigits.slice(2);
  } else if (mobileDigits.startsWith('0') && mobileDigits.length === 11) {
    mobileDigits = mobileDigits.slice(1);
  }

  if (/^[6-9]\d{9}$/.test(mobileDigits)) {
    return { isValid: true, normalized: `+91 ${mobileDigits}`, type: 'MOBILE' };
  }

  // 4. Indian Landline with STD code (e.g. 0821-2520512 or 8212520512)
  let landlineDigits = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  if (/^[1-9]\d{9,10}$/.test(landlineDigits)) {
    return { isValid: true, normalized: `0${landlineDigits}`, type: 'LANDLINE' };
  }

  return {
    isValid: false,
    normalized: cleaned,
    type: 'INVALID',
    error: 'Invalid phone format. Please enter a valid Indian emergency code (e.g. 112, 108), toll-free (1800-xxx-xxx), or 10-digit mobile/landline.'
  };
}

// ==========================================
// 5. DETERMINISTIC SAFETY LAYER & AI DECISION ENGINE
// ==========================================

export interface HighRiskSignalMatch {
  detected: boolean;
  category: EmergencyCategoryType;
  symptomsMatched: string[];
  severity: EmergencyUrgencyClass;
  explanation: string;
}

export function evaluateDeterministicSafety(userText: string): HighRiskSignalMatch {
  if (!userText || typeof userText !== 'string') {
    return {
      detected: false,
      category: 'ALL_OTHER',
      symptomsMatched: [],
      severity: 'UNCERTAIN — HUMAN MEDICAL HELP ADVISED',
      explanation: 'No symptoms described.'
    };
  }

  const text = userText.toLowerCase();

  // Explicit non-emergency / routine request filter
  const isRoutine =
    /\b(pharmacy near me|chemist|routine checkup|skin cream|general check|regular clinic|eye test|ayurvedic consultation|vitamins|bandage)\b/i.test(
      text
    ) && !/\b(pain|bleed|unconscious|breath|faint|poison|burn|stroke|emergency|heavy|seizure|chok)\b/i.test(text);

  if (isRoutine) {
    return {
      detected: false,
      category: 'ALL_OTHER',
      symptomsMatched: [],
      severity: 'NON-EMERGENCY RESOURCE',
      explanation: 'Routine medical resource query detected.'
    };
  }

  // High-Risk Signal 1: Heart / Chest Pain / Radiating Pain
  if (
    /\b(chest pain|heart attack|angina|sweating.*chest|chest.*sweat|crushing chest|radiating to arm|chest pressure|heart pain|cardiac arrest|chest tightness)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'HEART_CHEST_PAIN',
      symptomsMatched: ['Severe chest pain / pressure', 'Possible cardiac event symptoms'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Chest pain or crushing chest pressure can be a sign of a cardiac emergency.'
    };
  }

  // High-Risk Signal 2: Pregnancy Emergencies / Heavy Bleeding / Labor
  if (
    /\b(pregnant|pregnancy|labor|water broke|heavy bleeding.*pregnant|pregnant.*bleeding|contractions|miscarriage|placenta)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'PREGNANCY_MATERNITY',
      symptomsMatched: ['Pregnancy with severe symptoms / bleeding', 'Obstetric distress'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Pregnancy with severe symptoms or bleeding requires urgent obstetric assessment.'
    };
  }

  // High-Risk Signal 3: Stroke / Sudden Neurological Deficit
  if (
    /\b(cannot speak|slurred speech|face drooping|face droop|arm weak|paralysis|one side weak|stroke|sudden confusion|loss of speech|sudden weakness)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'STROKE_NEURO',
      symptomsMatched: ['Sudden loss of speech', 'Unilateral weakness / facial drooping'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Sudden weakness on one side or speech difficulty are recognized emergency signs of acute stroke.'
    };
  }

  // High-Risk Signal 4: Breathing Difficulty / Choking / Gasping
  if (
    /\b(difficulty breathing|shortness of breath|trouble breathing|cannot breathe|cant breathe|choking|gasping|wheezing severely|severe asthma|strangled)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'BREATHING_DIFFICULTY',
      symptomsMatched: ['Severe difficulty breathing', 'Respiratory distress'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Severe breathing difficulty or respiratory compromise is a critical medical emergency.'
    };
  }

  // High-Risk Signal 5: Poisoning / Chemical Ingestion / Toxin
  if (
    /\b(swallowed.*chemical|swallowed.*poison|chemical.*ingestion|swallowed.*bleach|drank.*pesticide|insecticide|poisoning|overdose|toxic substance|drank.*battery acid|ingested.*pills|swallowed.*pills|poison)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'POISONING',
      symptomsMatched: ['Ingestion of chemical / poison / toxin', 'Potential acute poisoning'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Swallowing an unknown chemical or toxic substance requires immediate emergency toxicology and medical care.'
    };
  }

  // High-Risk Signal 6: Unconscious / Unresponsive / Fainting
  if (
    /\b(unconscious|unresponsive|passed out|fainted|fainting|no response|collapsed|cannot wake|coma|not waking up)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'UNCONSCIOUS_FAINTING',
      symptomsMatched: ['Unconsciousness', 'Unresponsiveness'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Unconsciousness or failure to respond indicates serious risk to airways and vital organs.'
    };
  }

  // High-Risk Signal 7: Severe Bleeding / Hemorrhage
  if (
    /\b(heavy bleeding|severe bleeding|bleeding profusely|spurting blood|cut artery|hemorrhage|blood pouring|deep wound.*blood)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'SEVERE_BLEEDING',
      symptomsMatched: ['Severe or arterial bleeding', 'Significant blood loss'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Severe uncontrolled bleeding requires urgent pressure and emergency hospital care.'
    };
  }

  // High-Risk Signal 8: Child in Serious Distress
  if (
    /\b(child.*unresponsive|baby.*choking|infant.*breathing|baby.*blue|child.*convulsion|toddler.*poison|child swallowed)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'CHILD_EMERGENCY',
      symptomsMatched: ['Pediatric severe distress', 'Child respiratory / neurological compromise'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'A child or infant in serious distress requires immediate pediatric emergency care.'
    };
  }

  // High-Risk Signal 9: Seizure / Convulsions
  if (/\b(seizure|convulsion|fitting|epilepsy attack|shaking uncontrollably|frothing at mouth)\b/i.test(text)) {
    return {
      detected: true,
      category: 'SEIZURE',
      symptomsMatched: ['Active seizure / convulsions'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Active seizures or prolonged convulsions require emergency medical supervision.'
    };
  }

  // High-Risk Signal 10: Suicide / Immediate Self-Harm Danger
  if (
    /\b(suicide|suicidal|kill myself|want to die|end my life|self harm|commit suicide|jump from building|swallowed all pills to die)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'MENTAL_HEALTH',
      symptomsMatched: ['Immediate crisis / suicidal danger'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Immediate crisis intervention is critical. Please connect with emergency services or Tele-MANAS.'
    };
  }

  // High-Risk Signal 11: Severe Accident / Polytrauma
  if (
    /\b(car crash|bike accident|head injury|fracture with bone out|hit by truck|fall from height|crush injury)\b/i.test(
      text
    )
  ) {
    return {
      detected: true,
      category: 'ACCIDENT_TRAUMA',
      symptomsMatched: ['Major vehicular accident or blunt trauma'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Major physical trauma requires immediate paramedic stabilization and emergency transport.'
    };
  }

  // High-Risk Signal 12: Snake / Animal Bite
  if (/\b(snake bite|bitten by snake|cobra|viper|venomous bite|rabid dog bite|scorpion)\b/i.test(text)) {
    return {
      detected: true,
      category: 'ANIMAL_SNAKE_BITE',
      symptomsMatched: ['Suspected venomous snake or animal bite'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Potential envenomation requires emergency medical observation and potential antivenom administration.'
    };
  }

  // High-Risk Signal 13: Burns / Fire
  if (/\b(severe burn|fire burn|chemical burn|scalded with hot oil|face burn)\b/i.test(text)) {
    return {
      detected: true,
      category: 'BURNS_FIRE',
      symptomsMatched: ['Severe thermal or chemical burns'],
      severity: 'HIGH PRIORITY EMERGENCY',
      explanation: 'Severe burns carry acute shock and infection risks requiring specialized trauma care.'
    };
  }

  // Moderate / Urgent Medical Query
  if (
    /\b(high fever|fever|vomiting continuously|severe stomach ache|abdominal pain|sprain|cut finger|asthma mild|infection|headache severe)\b/i.test(
      text
    )
  ) {
    return {
      detected: false,
      category: 'ALL_OTHER',
      symptomsMatched: ['Acute discomfort or pain'],
      severity: 'URGENT MEDICAL HELP',
      explanation: 'Symptoms may warrant prompt medical evaluation by a licensed physician.'
    };
  }

  // Default / Uncertain
  return {
    detected: false,
    category: 'ALL_OTHER',
    symptomsMatched: [],
    severity: 'UNCERTAIN — HUMAN MEDICAL HELP ADVISED',
    explanation: 'Information provided is limited. Professional medical guidance is advised if symptoms persist.'
  };
}

// Generate Compliant AI Emergency Response
export function generateAiEmergencyResponse(
  userDescription: string,
  availableFacilities: MedicalFacility[] = INITIAL_VERIFIED_FACILITIES
): AiEmergencyResponse {
  const safetyEval = evaluateDeterministicSafety(userDescription);
  const routing = EMERGENCY_ROUTING_REGISTRY[safetyEval.category];

  // Filter facilities relevant to routing category
  const matchingFacilities = availableFacilities
    .filter((f) => f.enabled !== false)
    .filter((f) => {
      if (safetyEval.severity === 'HIGH PRIORITY EMERGENCY') {
        // High priority must have emergency department or match relevant specialties
        return (
          f.hasEmergencyDepartment ||
          f.specialties.some((s) => routing.relevantSpecialties.includes(s))
        );
      }
      return true;
    })
    .slice(0, 3);

  // If High-Risk signal was triggered
  if (safetyEval.detected || safetyEval.severity === 'HIGH PRIORITY EMERGENCY') {
    let specialized: { label: string; number: string; service: string } | undefined;
    if (safetyEval.category === 'POISONING') {
      specialized = {
        label: 'CALL 1800-116-117',
        number: '1800-116-117',
        service: 'National Poisons Information Centre (AIIMS New Delhi)'
      };
    } else if (safetyEval.category === 'MENTAL_HEALTH') {
      specialized = {
        label: 'CALL 14416',
        number: '14416',
        service: 'Tele-MANAS Mental Health Support'
      };
    } else if (safetyEval.category === 'PREGNANCY_MATERNITY') {
      specialized = {
        label: 'CALL 102',
        number: '102',
        service: 'Janani Shishu Suraksha Maternity Ambulance'
      };
    }

    return {
      assessment: 'These symptoms can be associated with a serious medical emergency.',
      recommendedAction: 'Contact emergency medical assistance immediately. Do not delay.',
      primaryContact: {
        label: 'CALL 112',
        number: '112'
      },
      ambulanceContact: {
        label: 'CALL 108',
        number: '108'
      },
      specializedContact: specialized,
      why: `Based on what you described (${safetyEval.symptomsMatched.join(', ') || 'reported symptoms'}), this situation requires immediate professional emergency care.`,
      nearbyFacilities: matchingFacilities,
      disclaimer: 'Do not delay emergency care while using this assistant. This is not a diagnosis application and does not prescribe treatments.',
      urgency: 'HIGH PRIORITY EMERGENCY',
      usefulQuestions: [
        'Is the person conscious and responding?',
        'Are they breathing normally?',
        'Is there severe or heavy bleeding?',
        'Are you currently at the location with the patient?'
      ],
      isDeterministicSafetyTriggered: true
    };
  }

  // Non-Emergency or Routine
  if (safetyEval.severity === 'NON-EMERGENCY RESOURCE') {
    const isPharmacyQuery = /\b(pharmacy|chemist|medicine|meds|drug)\b/i.test(userDescription);
    let routineFacilities = availableFacilities.filter((f) => f.enabled !== false);
    if (isPharmacyQuery) {
      const pharms = routineFacilities.filter((f) => f.type === 'Pharmacy');
      routineFacilities = pharms.length > 0 ? pharms : routineFacilities;
    } else {
      routineFacilities = routineFacilities.filter(
        (f) => f.type === 'Pharmacy' || f.type === 'Clinic' || f.type === 'Hospital'
      );
    }
    const matchingRoutine = routineFacilities.slice(0, 3);

    return {
      assessment: 'This request appears to be for routine medical resources or pharmacy services.',
      recommendedAction: 'Browse nearby verified facilities or contact them directly for non-emergency healthcare needs.',
      primaryContact: {
        label: 'CALL 104',
        number: '104'
      },
      ambulanceContact: {
        label: 'CALL 112',
        number: '112'
      },
      why: 'No high-risk emergency symptoms were indicated in your description.',
      nearbyFacilities: matchingRoutine,
      disclaimer: 'If conditions change or symptoms worsen suddenly, contact 112 or 108 immediately.',
      urgency: 'NON-EMERGENCY RESOURCE',
      isDeterministicSafetyTriggered: false
    };
  }

  // Urgent or Uncertain
  return {
    assessment: 'These symptoms may require prompt medical evaluation by a licensed physician.',
    recommendedAction: 'Consult a nearby healthcare provider or hospital. In case of sudden deterioration, call 112.',
    primaryContact: {
      label: 'CALL 104 (HEALTH ADVICE)',
      number: '104'
    },
    ambulanceContact: {
      label: 'CALL 112 / 108',
      number: '112'
    },
    why: safetyEval.explanation,
    nearbyFacilities: matchingFacilities.length > 0 ? matchingFacilities : availableFacilities.slice(0, 3),
    disclaimer: 'Do not delay seeking medical attention. This assistant provides emergency routing, not clinical diagnosis.',
    urgency: safetyEval.severity,
    usefulQuestions: [
      'How long have you or the patient experienced these symptoms?',
      'Are the symptoms getting progressively worse?'
    ],
    isDeterministicSafetyTriggered: false
  };
}

// ==========================================
// 6. MULTI-CRITERIA & NLP SEARCH ENGINE
// ==========================================

export interface MedicalSearchOptions {
  query?: string;
  categoryFilter?: string; // 'All' | 'Hospital' | 'Clinic' | 'Pharmacy' | 'Ambulance' | 'Blood Bank' | 'Maternity' | 'Emergency Department' | 'Specialty'
  sortBy?: 'NEAREST' | 'EMERGENCY_FIRST' | 'NAME' | 'DISTANCE';
  userDistrict?: string;
}

export function searchMedicalFacilities(
  facilities: MedicalFacility[],
  options: MedicalSearchOptions = {}
): MedicalFacility[] {
  let results = [...facilities].filter((f) => f.enabled !== false);
  const q = (options.query || '').toLowerCase().trim();

  if (q) {
    // Natural Language Synonym Mapping
    const isChestPainSearch = /\b(chest pain|heart|cardiac|coronary|heart hospital)\b/i.test(q);
    const isMaternitySearch = /\b(maternity|pregnancy|pregnant|delivery|gynecology|obstetric|labor)\b/i.test(q);
    const isPediatricSearch = /\b(child|children|pediatric|baby|infant|kid)\b/i.test(q);
    const isPoisonSearch = /\b(poison|chemical|toxic|antivenom|snake)\b/i.test(q);
    const isPharmacySearch = /\b(pharmacy|medicine|chemist|drug|24 hour pharmacy|tablets)\b/i.test(q);
    const isBloodSearch = /\b(blood|blood bank|platelet|plasma)\b/i.test(q);
    const isAmbulanceSearch = /\b(ambulance|als|bls|patient transport)\b/i.test(q);
    const isEmergencyDeptSearch = /\b(emergency|trauma|casualty|icu|emergency department|near me)\b/i.test(q);
    const isNeuroSearch = /\b(stroke|brain|neurology|neuro)\b/i.test(q);
    const isMentalHealthSearch = /\b(mental health|psychiatry|counseling|depression)\b/i.test(q);

    results = results.filter((facility) => {
      const nameMatch = facility.name.toLowerCase().includes(q);
      const addressMatch = facility.address.toLowerCase().includes(q);
      const typeMatch = facility.type.toLowerCase().includes(q);
      const specialtyMatch = facility.specialties.some((s) => s.toLowerCase().includes(q));

      if (nameMatch || addressMatch || typeMatch || specialtyMatch) return true;

      // Natural language matching rules
      if (isChestPainSearch && (facility.specialties.includes('Cardiology') || facility.specialties.includes('Heart Emergency'))) return true;
      if (isMaternitySearch && (facility.specialties.includes('Maternity') || facility.specialties.includes('Pregnancy Emergency') || facility.specialties.includes('High-Risk Obstetrics'))) return true;
      if (isPediatricSearch && (facility.specialties.includes('Pediatrics') || facility.specialties.includes('Child Emergency') || facility.specialties.includes('Neonatal Intensive Care (NICU)'))) return true;
      if (isPoisonSearch && (facility.specialties.includes('Poison Management') || facility.specialties.includes('Toxicology ICU') || facility.specialties.includes('Antivenom & Injections'))) return true;
      if (isPharmacySearch && facility.type === 'Pharmacy') return true;
      if (isBloodSearch && (facility.type === 'Blood Bank' || facility.specialties.includes('Blood Bank'))) return true;
      if (isAmbulanceSearch && (facility.type === 'Ambulance' || facility.specialties.includes('Ambulance'))) return true;
      if (isEmergencyDeptSearch && facility.hasEmergencyDepartment) return true;
      if (isNeuroSearch && (facility.specialties.includes('Neurology') || facility.specialties.includes('Stroke Center'))) return true;
      if (isMentalHealthSearch && (facility.specialties.includes('Psychiatry') || facility.specialties.includes('Mental Health'))) return true;

      return false;
    });
  }

  // Category Filtering
  if (options.categoryFilter && options.categoryFilter !== 'All') {
    const filter = options.categoryFilter;
    if (filter === 'Hospital') results = results.filter((f) => f.type === 'Hospital');
    else if (filter === 'Clinic') results = results.filter((f) => f.type === 'Clinic');
    else if (filter === 'Pharmacy') results = results.filter((f) => f.type === 'Pharmacy');
    else if (filter === 'Ambulance') results = results.filter((f) => f.type === 'Ambulance');
    else if (filter === 'Blood Bank') results = results.filter((f) => f.type === 'Blood Bank' || f.specialties.includes('Blood Bank'));
    else if (filter === 'Emergency Department') results = results.filter((f) => f.hasEmergencyDepartment);
    else if (filter === 'Maternity') results = results.filter((f) => f.specialties.includes('Maternity') || f.specialties.includes('Pregnancy Emergency'));
    else if (filter === 'Specialty') results = results.filter((f) => f.specialties.length > 3);
  }

  // Sorting
  const sortBy = options.sortBy || 'NEAREST';
  if (sortBy === 'NEAREST' || sortBy === 'DISTANCE') {
    results.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sortBy === 'EMERGENCY_FIRST') {
    results.sort((a, b) => {
      if (a.hasEmergencyDepartment && !b.hasEmergencyDepartment) return -1;
      if (!a.hasEmergencyDepartment && b.hasEmergencyDepartment) return 1;
      if (a.is24x7 && !b.is24x7) return -1;
      if (!a.is24x7 && b.is24x7) return 1;
      return a.distanceKm - b.distanceKm;
    });
  } else if (sortBy === 'NAME') {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  return results;
}
