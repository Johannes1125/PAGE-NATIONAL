import { ApplicationFormState } from './membership-types';

/**
 * Programmatically populates and triggers download of fillable PDF Acroforms
 * for LIFE, REGULAR, ASSOCIATE, or INSTITUTIONAL member application details.
 */
export async function generateAcroform(app: any): Promise<void> {
  const isFormState = !app.profileData && typeof app.membershipType === 'string' && app.fullName !== undefined;

  let profile: any = {};
  let eduJob: any = {};
  let exp: any = {};
  let refs: any = {};
  let membershipType = '';
  let photoUrl = '';

  if (isFormState) {
    profile = app;
    eduJob = app;
    exp = app;
    refs = app;
    membershipType = app.membershipType?.toLowerCase() || '';
    if (app.documents?.photo_1x1) {
      photoUrl = typeof app.documents.photo_1x1 === 'string'
        ? app.documents.photo_1x1
        : (app.documents.photo_1x1.url || '');
    }
  } else {
    profile = app.profileData || {};
    eduJob = app.educationJobData || {};
    exp = app.experienceData || {};
    refs = app.referencesData || {};
    membershipType = app.membershipType?.toLowerCase() || '';
    const photoDoc = app.documents?.find((d: any) => d.documentType === 'photo_1x1');
    if (photoDoc) {
      photoUrl = photoDoc.fileUrl;
    }
  }

  const pdfUrl = `/forms/${
    membershipType === 'life'
      ? 'New LIFE Membership Form Acroform copy.pdf'
      : membershipType === 'institutional'
      ? 'New INSTITUTIONAL Membership Form Acroform.pdf'
      : 'New REGULAR-ASSOCIATE Membership Form Acroform copy.pdf'
  }`;

  // 1. Fetch template bytes
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to retrieve PDF template: ${pdfUrl}`);
  }
  const pdfBytes = await response.arrayBuffer();

  // 2. Load PDF document
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Helper to safely set text fields
  const safeSet = (fieldName: string, value: any) => {
    try {
      const field = form.getField(fieldName);
      if (field && field.constructor.name === 'PDFTextField') {
        form.getTextField(fieldName).setText(String(value ?? ''));
      }
    } catch (e) {
      console.warn(`Field "${fieldName}" not set:`, e);
    }
  };

  // 3. Populate fields based on type
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  if (membershipType === 'life' || membershipType === 'regular' || membershipType === 'associate') {
    safeSet('Name', profile.name || profile.fullName || '');
    safeSet('Email Address', profile.emailAddress || profile.email || '');
    safeSet('Region', profile.region || '');
    safeSet('Home Address', profile.homeAddress || '');
    safeSet('Mobile. No', profile.telMobileNo || profile.phone || '');
    safeSet('Tel. No', profile.telephoneNo || '');

    if (membershipType === 'life' || membershipType === 'regular') {
      safeSet('Where Employed', eduJob.whereEmployed || eduJob.institution || '');
      safeSet('Business Address', eduJob.businessAddress || eduJob.address || '');
      safeSet('Present Position', eduJob.presentPosition || '');
      safeSet('Degree Obtained', eduJob.degreeObtained || '');
      safeSet('Specialization', eduJob.specialization || '');
      safeSet('Institution', eduJob.institution || eduJob.degreeInstitution || '');
      safeSet('Year Obtained', eduJob.yearObtained !== undefined ? String(eduJob.yearObtained) : '');

      // Experience mapping (safely extract first records)
      safeSet('Teaching Experience', exp.teachingExperience?.[0]?.institution || '');
      safeSet('Teaching Start Date', exp.teachingExperience?.[0]?.fromYear || '');
      safeSet('Teaching End Date', exp.teachingExperience?.[0]?.toYear || '');
      safeSet('Administrative Experience', exp.administrativeExperience?.[0]?.institution || '');
      safeSet('Administrative Start Date', exp.administrativeExperience?.[0]?.fromYear || '');

      // Publications
      safeSet('Recent Articles, Researches, Books Written', exp.recentPublications?.[0] || '');
      safeSet('Recent Articles, Researches, Books Written 2', exp.recentPublications?.[1] || '');
      safeSet('Recent Articles, Researches, Books Written 3', exp.recentPublications?.[2] || '');
      safeSet('Recent Articles, Researches, Books Written 4', exp.recentPublications?.[3] || '');

      // Memberships
      safeSet('Membership/Officership in other recognized Association', exp.professionalMemberships?.[0] || '');
      safeSet('Membership/Officership in other recognized Association 2', exp.professionalMemberships?.[1] || '');
      safeSet('Membership/Officership in other recognized Association 3', exp.professionalMemberships?.[2] || '');
    } else {
      // Associate profile mapping
      safeSet('Where Employed', eduJob.institution || '');
      safeSet('Present Position', eduJob.presentPosition || '');
      safeSet('Degree Obtained', eduJob.currentEnrollmentStatus || '');
      safeSet('Year Obtained', eduJob.expectedGraduationYear || '');
      safeSet('Specialization', eduJob.researchInterests || '');
      safeSet('Institution', eduJob.institution || '');

      safeSet('Teaching Experience', exp.teachingExp || '');
      safeSet('Teaching Institution', exp.teachingInst || '');
      safeSet('Teaching Start Date', exp.teachingFrom || '');
      safeSet('Teaching End Date', exp.teachingTo || '');

      safeSet('Administrative Experience', exp.adminExp || '');
      safeSet('Administrative Institution', exp.adminInst || '');
      safeSet('Administrative Start Date', exp.adminFrom || '');

      safeSet('Recent Articles, Researches, Books Written', exp.pub1 || '');
      safeSet('Recent Articles, Researches, Books Written 2', exp.pub2 || '');
      safeSet('Recent Articles, Researches, Books Written 3', exp.pub3 || '');
      safeSet('Recent Articles, Researches, Books Written 4', exp.pub4 || '');

      safeSet('Membership/Officership in other recognized Association', exp.assoc1 || '');
      safeSet('Membership/Officership in other recognized Association 2', exp.assoc2 || '');
      safeSet('Membership/Officership in other recognized Association 3', exp.assoc3 || '');
    }

    // Character references
    safeSet('1st Reference Name', refs.characterReferences?.[0]?.name || refs.ref1Name || '');
    safeSet('1st Reference Position', refs.characterReferences?.[0]?.position || refs.ref1Position || '');
    safeSet('1st Reference Address', refs.characterReferences?.[0]?.address || refs.ref1Address || '');
    safeSet('2nd Reference Name', refs.characterReferences?.[1]?.name || refs.ref2Name || '');
    safeSet('2nd Reference Address', refs.characterReferences?.[1]?.address || refs.ref2Address || '');

    // Set checkboxes for regular-associate template
    if (membershipType === 'regular' || membershipType === 'associate') {
      try {
        if (membershipType === 'regular') {
          form.getCheckBox('Regular Member').check();
        } else {
          form.getCheckBox('Associate Member').check();
        }
      } catch (e) {
        console.warn('Regular/Associate checkbox error:', e);
      }
    }

    safeSet('Date Signed', todayStr);
    safeSet('Printed Name of Applicant', profile.name || profile.fullName || '');

  } else if (membershipType === 'institutional') {
    safeSet('College/University Name', profile.collegeUniversityName || '');
    safeSet('College Address', profile.institutionAddress || '');
    safeSet('Tel. No', profile.telMobileNo || '');
    safeSet('Mobile. No', profile.phone || '');
    safeSet('Email Address', profile.emailAddress || '');
    safeSet('President of College/University', profile.presidentName || '');
    safeSet('Dean of Graduate School', profile.deanHeadGraduateSchool || '');

    // Year range splitted
    if (eduJob.enrollmentYearRange) {
      const parts = eduJob.enrollmentYearRange.split('-');
      if (parts[0]) safeSet('Starting Year last two digits in year', parts[0].trim().slice(-2));
      if (parts[1]) safeSet('Ending Year last two digits in year', parts[1].trim().slice(-2));
    }

    // Courses
    safeSet('Education Offered', eduJob.educationCoursesOffered?.[0] || '');
    safeSet('Education Offered 2', eduJob.educationCoursesOffered?.[1] || '');
    safeSet('Education Offered 3', eduJob.educationCoursesOffered?.[2] || '');
    safeSet('Graduate Courses Offered', eduJob.graduateCoursesOffered?.[0] || '');
    safeSet('Graduate Courses Offered 2', eduJob.graduateCoursesOffered?.[1] || '');
    safeSet('Graduate Courses Offered 3', eduJob.graduateCoursesOffered?.[2] || '');

    safeSet('Graduate School Faculty Members', eduJob.totalGraduateFaculty !== undefined ? String(eduJob.totalGraduateFaculty) : '');
    safeSet('Graduate School Current Enrolled', eduJob.currentEnrollmentCount !== undefined ? String(eduJob.currentEnrollmentCount) : '');

    // Affiliations
    safeSet('Membership/Officership in other recognized Association', exp.professionalAffiliations?.[0] || '');
    safeSet('Membership/Officership in other recognized Association 2', exp.professionalAffiliations?.[1] || '');
    safeSet('Membership/Officership in other recognized Association 3', exp.professionalAffiliations?.[2] || '');

    // References
    safeSet('1st Reference Name', refs.characterReferences?.[0]?.name || '');
    safeSet('1st Reference Position', refs.characterReferences?.[0]?.position || '');
    safeSet('1st Reference Address', refs.characterReferences?.[0]?.address || '');
    safeSet('2nd Reference Name', refs.characterReferences?.[1]?.name || '');
    safeSet('2nd Reference Address', refs.characterReferences?.[1]?.address || '');

    safeSet('Date Signed', todayStr);
    safeSet('Printed Name of Applicant', profile.presidentName || profile.deanHeadGraduateSchool || '');
  }

  // 4. Handle 1x1 Photo embedding in PDF (applicable for LIFE / REGULAR / ASSOCIATE)
  if (photoUrl && membershipType !== 'institutional') {
    try {
      const cleanPhotoUrl = photoUrl.startsWith('http') ? photoUrl : `${window.location.origin}${photoUrl}`;
      const imgRes = await fetch(cleanPhotoUrl);
      if (imgRes.ok) {
        const imgBytes = await imgRes.arrayBuffer();
        let img;
        if (cleanPhotoUrl.toLowerCase().endsWith('.png')) {
          img = await pdfDoc.embedPng(imgBytes);
        } else {
          img = await pdfDoc.embedJpg(imgBytes);
        }
        try {
          const button = form.getButton('1x1 Image of Applicant');
          if (button) {
            button.setImage(img);
          }
        } catch (buttonErr) {
          console.warn('1x1 Image of Applicant button field not found in PDF:', buttonErr);
        }
      }
    } catch (photoErr) {
      console.warn('Could not embed photo into Acroform PDF:', photoErr);
    }
  }

  // 5. Flatten form (makes it read-only so values cannot be edited easily in PDF reader)
  form.flatten();

  // 6. Save PDF and trigger browser download
  const filledPdfBytes = await pdfDoc.save();
  const blob = new Blob([filledPdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = downloadUrl;
  
  const nameSlug = (profile.name || profile.fullName || 'Member').replace(/\s+/g, '_');
  link.download = `PAGE_Membership_Form_${nameSlug}_${membershipType.toUpperCase()}.pdf`;
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
