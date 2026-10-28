const demoApplications = new Map();

export const isAnganwadiApplicationDemoMode = true;

const getAccountField = (account, ...fieldNames) => {
  const profiles = [account, account?.profile, account?.user, account?.data];
  for (const profile of profiles) {
    for (const fieldName of fieldNames) {
      const value = profile?.[fieldName];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return "";
};

const createInitialApplication = (account = {}) => ({
  applicant_id: getAccountField(account, "unique_id"),
  status: "step0",
  filer_name: getAccountField(account, "name", "full_name", "username"),
  fath_husb_name: "",
  dob: "",
  age: "",
  filer_mob: getAccountField(account, "phone", "mobile_no"),
  filer_email: getAccountField(account, "email"),
  filer_adhar: getAccountField(
    account,
    "adhar_no",
    "aadhaar_no",
    "aadhar_no",
    "aadhaar_number",
    "aadhar_number",
    "filer_adhar",
  ),
  edu_qual: "",
  district: getAccountField(account, "district"),
  project: getAccountField(account, "project"),
  awc_center: getAccountField(account, "awc_center"),
  joining_date: getAccountField(account, "joining_date"),
  village: "",
  address: "",
  city: "",
  pincode: "",
  acc_holder: "",
  acc_no: "",
  acc_ifsc: "",
  bank_name: "",
  pancard: "",
  pmmvy_tot: "",
  pmmvy_obt: "",
  cmmk_tot: "",
  cmmk_obt: "",
  nanda1_tot: "",
  nanda1_obt: "",
  nanda2_tot: "",
  nanda2_obt: "",
  pt_tot: "",
  pt_obt: "",
  survey_tot: "300",
  survey_obt: "",
  ann_tot: "",
  ann_obt: "",
  pt_group_tot: "24",
  pt_group_obt: "",
  pt_group_img: "",
  sandharbh_tot: "",
  sandharbh_obt: "",
  sandharbh_img: "",
  sam_tot: "",
  sam_obt: "",
  sam_detail: "",
  sam_img: "",
  vhsnd_tot: "52",
  vhsnd_obt: "",
  pt_ben_tot: "",
  pt_ben_obt: "",
  abhilekh_tot: "",
  abhilekh_obt: "",
  saaf_ans: [],
  krimi_tot: "",
  krimi_obt: "",
  poshan_week_tot: "",
  poshan_week_obt: "",
  sam_6mon_tot: "",
  sam_6mon_img: "",
  sam_6yr_tot: "",
  sam_6yr_img: "",
  mam_6mon_tot: "",
  mam_6mon_img: "",
  gambhir_tot: "",
  gambhir_detail: "",
  gambhir_img: "",
  rbsk_tot: "2",
  rbsk_obt: "",
  rbsk_surv_obt: "",
  other_work_detail: "",
  other_work_img: "",
  dept_work_detail: "",
  per_work_detail: "",
  ach_work: "",
  aharta1: "",
  aharta2: "",
  aharta3: "",
  aharta4: "",
  manak2: "",
  manak3a: "",
  manak3b: "",
  manak4: "",
  photo_img: "",
  signature: "",
  declarationAccepted: false,
});

export const getAnganwadiApplication = async (account) => {
  const key = String(
    account?.unique_id || account?.phone || account?.mobile_no || "demo-user",
  );
  const existing = demoApplications.get(key);
  if (existing) {
    const application = {
      ...existing,
      applicant_id:
        existing.applicant_id || getAccountField(account, "unique_id"),
      filer_adhar:
        existing.filer_adhar ||
        getAccountField(
          account,
          "adhar_no",
          "aadhaar_no",
          "aadhar_no",
          "aadhaar_number",
          "aadhar_number",
          "filer_adhar",
        ),
    };
    demoApplications.set(key, application);
    return { key, application: { ...application } };
  }

  const application = createInitialApplication(account);
  demoApplications.set(key, application);
  return { key, application: { ...application } };
};

export const saveAnganwadiApplicationStep = async (
  key,
  application,
  step,
) => {
  const existing = demoApplications.get(key) || createInitialApplication();
  const saved = {
    ...existing,
    ...application,
    status: `step${step}`,
  };
  demoApplications.set(key, saved);
  return { ...saved };
};

export const submitAnganwadiApplication = async (key, application) => {
  const existing = demoApplications.get(key) || createInitialApplication();
  const submitted = {
    ...existing,
    ...application,
    status: "final",
  };
  demoApplications.set(key, submitted);
  return { ...submitted };
};
