import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_smart_campus_jwt_secret_key_2026';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      role,
      password,
      q1,
      a1,
      q2,
      a2,
      q3,
      a3,
      fullName,
      rollNumber,
      className,
      semester,
      department,
      dob,
      bloodGroup,
      gender,
      email,
      mobile,
      address,
      fatherName,
      motherName,
      parentContact,
      parentOccupation,
      admissionDate,
      section,
      hobbies,
      interests,
      skills,
      employeeId,
      designation,
      joiningDate,
      subjectsTaught,
      parentName,
      parentEmail,
      parentMobile,
      occupation,
      studentName,
      studentRollNumber,
      relationship,
      graduationYear,
      currentCompany,
      currentDesignation,
      linkedIn,
      accessLevel,
      isClassIncharge,
      inchargeClass,
      photoUrl,
      admissionNumber,
      collegeName,
      degreeClass,
      joiningYear,
      endingYear,
      studyYear,
      govtIdType,
      govtIdNumber,
      govtIdPhotoUrl,
      collegeDocUrl,
      fatherPhone,
      fatherEmail,
      fatherPhotoUrl,
      fatherGovtIdType,
      fatherGovtIdNumber,
      fatherGovtIdPhotoUrl,
      motherPhone,
      motherEmail,
      motherPhotoUrl,
      motherGovtIdType,
      motherGovtIdNumber,
      motherGovtIdPhotoUrl,
      conveyanceMode,
      busRoute,
      busCharges,
      busPaymentStatus,
      vehicleType,
      parkingPaymentTerm,
      parkingFee,
      parkingPaymentStatus,
      residenceType,
      hostelName,
      roomNumber,
      hostelPaymentTerm,
      hostelFee,
      hostelPaymentStatus,
      hostelDocUrl,
      hostelCardUrl,
      username,
      coverPhotoUrl,
      batch,
      degree,
      studentRegistrationNumber,
      currentCity,
      currentCountry,
      industry,
      bio,
      linkedinUrl,
      githubUrl,
      otherLinks,
      privacyLevel,
      mentorshipAvailable,
      jobProvider,
    } = req.body;

    if (!role || !password) {
      res.status(400).json({ status: 'error', message: 'Role and password are required.' });
      return;
    }

    let identifier = '';
    let insertedId = 0;

    if (role === 'Student') {
      identifier = rollNumber || email;
      // Build official composite class format: e.g. "B.TECH CSE 2023 A"
      const computedClass = degreeClass && department && joiningYear && section
        ? `${degreeClass.trim()} ${department.trim()} ${joiningYear.trim()} ${section.trim()}`
        : className || 'B.TECH CSE 2023 A';

      const studentFields = [
        'full_name', 'admission_number', 'roll_number', 'college_name', 'class', 'degree_class',
        'joining_year', 'ending_year', 'study_year', 'semester', 'department', 'dob', 'blood_group', 'gender',
        'photograph_url', 'email', 'mobile', 'address', 'govt_id_type', 'govt_id_number', 'govt_id_photo_url',
        'college_doc_url', 'father_name', 'father_phone', 'father_email', 'father_photo_url',
        'father_govt_id_type', 'father_govt_id_number', 'father_govt_id_photo_url', 'mother_name', 'mother_phone',
        'mother_email', 'mother_photo_url', 'mother_govt_id_type', 'mother_govt_id_number', 'mother_govt_id_photo_url',
        'parent_contact', 'parent_occupation', 'admission_date', 'section', 'hobbies', 'interests',
        'skills', 'conveyance_mode', 'bus_route', 'bus_charges', 'bus_payment_status', 'vehicle_type',
        'parking_payment_term', 'parking_fee', 'parking_payment_status', 'residence_type',
        'hostel_name', 'room_number', 'hostel_payment_term', 'hostel_fee', 'hostel_payment_status',
        'hostel_doc_url', 'hostel_card_url', 'password', 'q1', 'a1', 'q2', 'a2', 'q3', 'a3'
      ];
      const placeholders = studentFields.map(() => '?').join(', ');

      const [result]: any = await pool.query(
        `INSERT INTO students (${studentFields.join(', ')}) VALUES (${placeholders})`,
        [
          fullName || '',
          admissionNumber || '',
          rollNumber || '',
          collegeName || '',
          computedClass,
          degreeClass || '',
          joiningYear || '',
          endingYear || '',
          studyYear || '',
          semester || 'Semester 1',
          department || '',
          dob || null,
          bloodGroup || 'O+',
          gender || 'Male',
          photoUrl || null,
          email || '',
          mobile || '',
          address || '',
          govtIdType || 'Aadhaar Card',
          govtIdNumber || '',
          govtIdPhotoUrl || null,
          collegeDocUrl || null,
          fatherName || '',
          fatherPhone || '',
          fatherEmail || '',
          fatherPhotoUrl || null,
          fatherGovtIdType || 'PAN Card',
          fatherGovtIdNumber || '',
          fatherGovtIdPhotoUrl || null,
          motherName || '',
          motherPhone || '',
          motherEmail || '',
          motherPhotoUrl || null,
          motherGovtIdType || 'Aadhaar Card',
          motherGovtIdNumber || '',
          motherGovtIdPhotoUrl || null,
          parentContact || fatherPhone || '',
          parentOccupation || '',
          admissionDate || null,
          section || '',
          hobbies || '',
          interests || '',
          typeof skills === 'object' ? JSON.stringify(skills) : (skills || ''),
          conveyanceMode || 'Self',
          busRoute || '',
          busCharges || 0.00,
          busPaymentStatus || 'Unpaid',
          vehicleType || '',
          parkingPaymentTerm || '',
          parkingFee || 0.00,
          parkingPaymentStatus || 'Unpaid',
          residenceType || 'Day Scholar',
          hostelName || '',
          roomNumber || '',
          hostelPaymentTerm || '',
          hostelFee || 0.00,
          hostelPaymentStatus || 'Unpaid',
          hostelDocUrl || null,
          hostelCardUrl || null,
          password,
          q1 || '',
          a1 || '',
          q2 || '',
          a2 || '',
          q3 || '',
          a3 || '',
        ]
      );
      insertedId = result.insertId;
    } else if (role === 'Faculty') {
      identifier = employeeId || email;
      const computedInchargeClass = (isClassIncharge === 'Yes' || isClassIncharge === '1')
        ? (degreeClass && department && joiningYear && section
            ? `${degreeClass.trim()} ${department.trim()} ${joiningYear.trim()} ${section.trim()}`
            : (inchargeClass || 'B.TECH CSE 2023 A'))
        : null;

      let sectionVal = section || null;
      if (!sectionVal && computedInchargeClass) {
        const parts = computedInchargeClass.trim().split(/\s+/);
        sectionVal = parts[parts.length - 1] || 'A';
      }

      const [result]: any = await pool.query(
        `INSERT INTO faculties (
          faculty_name, employee_id, department, designation, email, mobile, dob,
          blood_group, address, joining_date, subjects_taught, photograph_url,
          is_class_incharge, incharge_class, section,
          password, q1, a1, q2, a2, q3, a3
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName || '',
          employeeId || '',
          department || '',
          designation || 'Assistant Professor',
          email || '',
          mobile || '',
          dob || null,
          bloodGroup || 'O+',
          address || '',
          joiningDate || null,
          subjectsTaught || '',
          photoUrl || null,
          isClassIncharge || 'No',
          computedInchargeClass,
          sectionVal,
          password,
          q1 || '',
          a1 || '',
          q2 || '',
          a2 || '',
          q3 || '',
          a3 || '',
        ]
      );
      insertedId = result.insertId;

      // Automatically sync or insert into classes table so faculty is recorded as class incharge
      if (computedInchargeClass && (isClassIncharge === 'Yes' || isClassIncharge === '1')) {
        try {
          const [existingClass]: any = await pool.query(
            `SELECT id FROM classes WHERE UPPER(REPLACE(class_code, " ", "")) = UPPER(REPLACE(?, " ", ""))`,
            [computedInchargeClass]
          );
          if (existingClass && existingClass.length > 0) {
            await pool.query(
              `UPDATE classes SET class_incharge_id = ?, class_incharge_email = ?, class_incharge_name = ? WHERE id = ?`,
              [insertedId, email || '', fullName || '', existingClass[0].id]
            );
          } else {
            await pool.query(
              `INSERT INTO classes (class_code, class_name, department, semester, section, class_incharge_id, class_incharge_email, class_incharge_name)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                computedInchargeClass,
                computedInchargeClass,
                department || 'CSE',
                semester || 'Semester 1',
                sectionVal || 'A',
                insertedId,
                email || '',
                fullName || '',
              ]
            );
          }
        } catch (clsErr) {
          console.error('Error syncing classes table during faculty registration:', clsErr);
        }
      }
    } else if (role === 'Parent') {
      identifier = parentEmail || studentRollNumber;
      const [parentResult]: any = await pool.query(
        `INSERT INTO parents (
          parent_name, email, mobile, occupation, address, student_name, student_roll_number,
          relationship, password, q1, a1, q2, a2, q3, a3
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parentName || fullName || '',
          parentEmail || email || '',
          parentMobile || mobile || '',
          occupation || '',
          address || '',
          studentName || '',
          studentRollNumber || '',
          relationship || 'Father',
          password,
          q1 || '',
          a1 || '',
          q2 || '',
          a2 || '',
          q3 || '',
          a3 || '',
        ]
      );
      insertedId = parentResult.insertId;

      // Automatically sync primary child into parent_student_links
      if (studentRollNumber) {
        try {
          const effectiveEmail = parentEmail || email || '';
          let effectiveStuName = studentName || '';
          if (!effectiveStuName) {
            const [stRows]: any = await pool.query('SELECT full_name FROM students WHERE roll_number = ? LIMIT 1', [studentRollNumber]);
            if (stRows.length > 0) effectiveStuName = stRows[0].full_name;
            else effectiveStuName = 'Student ' + studentRollNumber;
          }
          const linkId = `LNK-${insertedId}-${studentRollNumber}`;
          await pool.query(
            `INSERT INTO parent_student_links (link_id, parent_email, student_roll, student_name, relationship, verification_status)
             VALUES (?, ?, ?, ?, ?, 'VERIFIED')
             ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)`,
            [linkId, effectiveEmail, studentRollNumber, effectiveStuName, relationship || 'Father']
          );
        } catch (linkErr) {
          console.warn('Auto parent_student_links sync warning:', linkErr);
        }
      }
      identifier = email || username || fullName;
      const alumniFields = [
        'full_name', 'username', 'email', 'password', 'mobile', 'photograph_url', 'cover_photo_url',
        'graduation_year', 'batch', 'degree', 'department', 'section', 'roll_number', 'student_registration_number',
        'college_name', 'current_city', 'current_country', 'current_company', 'current_designation',
        'industry', 'skills', 'bio', 'linkedin_url', 'github_url', 'other_links', 'alumni_id',
        'verification_status', 'privacy_level', 'mentorship_available', 'job_provider',
        'q1', 'a1', 'q2', 'a2', 'q3', 'a3'
      ];
      const placeholders = alumniFields.map(() => '?').join(', ');

      const [result]: any = await pool.query(
        `INSERT INTO alumni (${alumniFields.join(', ')}) VALUES (${placeholders})`,
        [
          fullName || '',
          username || (email ? email.split('@')[0] : `alumni_${Date.now()}`),
          email || '',
          password,
          mobile || '',
          photoUrl || null,
          coverPhotoUrl || null,
          graduationYear || '2023',
          batch || `${degreeClass || 'B.Tech'} ${graduationYear || '2023'}`,
          degreeClass || degree || 'B.Tech',
          department || 'Computer Science',
          section || 'A',
          rollNumber || studentRegistrationNumber || `ALM-${Date.now()}`,
          studentRegistrationNumber || rollNumber || '',
          collegeName || 'NEXUS Institute of Technology',
          currentCity || 'New Delhi',
          currentCountry || 'India',
          currentCompany || '',
          currentDesignation || '',
          industry || 'Software & Technology',
          typeof skills === 'object' ? JSON.stringify(skills) : (skills || ''),
          bio || '',
          linkedIn || linkedinUrl || '',
          githubUrl || '',
          otherLinks || '',
          null, // alumni_id is generated upon admin verification
          'PENDING', // Default verification status is PENDING
          privacyLevel || 'CAMPUS_ONLY',
          mentorshipAvailable !== undefined ? (mentorshipAvailable ? 1 : 0) : 1,
          jobProvider !== undefined ? (jobProvider ? 1 : 0) : 0,
          q1 || '',
          a1 || '',
          q2 || '',
          a2 || '',
          q3 || '',
          a3 || '',
        ]
      );
      insertedId = result.insertId;
    } else if (role === 'Administrator') {
      identifier = fullName || email;
      const [result]: any = await pool.query(
        `INSERT INTO administrators (
          admin_name, email, mobile, department, access_level, address,
          password, q1, a1, q2, a2, q3, a3
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullName || '',
          email || '',
          mobile || '',
          department || 'IT Administration',
          accessLevel || 'Super Admin',
          address || '',
          password,
          q1 || '',
          a1 || '',
          q2 || '',
          a2 || '',
          q3 || '',
          a3 || '',
        ]
      );
      insertedId = result.insertId;
    }

    res.status(201).json({
      status: 'success',
      message: role === 'Alumni'
        ? 'Alumni registration submitted successfully! Your account is pending admin verification.'
        : 'Registration successful! You can now log in.',
      role,
      identifier,
      id: insertedId,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Server error during registration.' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email, username, fullName, rollNumber, alumniId, facultyName, studentName, studentRollNumber, adminName, mobile, password } = req.body;

    let user: any = null;

    if (role === 'Student') {
      const [rows]: any = await pool.query(
        `SELECT * FROM students WHERE roll_number = ? OR full_name = ? LIMIT 1`,
        [rollNumber || '', fullName || '']
      );
      user = rows[0];
    } else if (role === 'Faculty') {
      const [rows]: any = await pool.query(
        `SELECT * FROM faculties WHERE faculty_name = ? OR employee_id = ? LIMIT 1`,
        [facultyName || '', facultyName || '']
      );
      user = rows[0];
    } else if (role === 'Parent') {
      const loginId = email || username || studentRollNumber || mobile || '';
      const [rows]: any = await pool.query(
        `SELECT * FROM parents WHERE email = ? OR student_roll_number = ? OR mobile = ? OR student_name = ? LIMIT 1`,
        [loginId, loginId, loginId, loginId]
      );
      user = rows[0];
    } else if (role === 'Alumni') {
      const [rows]: any = await pool.query(
        `SELECT * FROM alumni WHERE email = ? OR username = ? OR alumni_id = ? OR full_name = ? OR student_registration_number = ? LIMIT 1`,
        [email || username || alumniId || fullName || '', email || username || alumniId || fullName || '', email || username || alumniId || fullName || '', email || username || alumniId || fullName || '', email || username || alumniId || fullName || '']
      );
      user = rows[0];
    } else if (role === 'Administrator') {
      const [rows]: any = await pool.query(
        `SELECT * FROM administrators WHERE admin_name = ? OR email = ? LIMIT 1`,
        [adminName || '', adminName || '']
      );
      user = rows[0];
    }

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: `Account not found for ${role} role in database. Please register your account first.`,
      });
      return;
    }

    // Direct Plain Text Password Comparison
    if (user.password !== password) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Password incorrect. Please try again.',
      });
      return;
    }

    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      status: 'success',
      message: `Welcome back to NEXUS ${role} Portal!`,
      token,
      user: {
        id: user.id,
        name: user.full_name || user.faculty_name || user.parent_name || user.admin_name,
        role,
        email: user.email,
        rollNumber: user.roll_number || user.student_roll_number || null,
        mobile: user.mobile || '9876543210',
        department: user.department || 'Computer Science & Engineering',
        className: user.class || 'BTECH CSE 4A',
        section: user.section || '4A',
        semester: user.semester || 'Semester 7',
        address: user.address || 'Nexus Smart Campus, Block A',
        photoUrl: user.photograph_url || null,
        coverPhotoUrl: user.cover_photo_url || null,
        isClassIncharge: user.is_class_incharge || 'No',
        inchargeClass: user.incharge_class || null,
        alumniId: user.alumni_id || null,
        verificationStatus: user.verification_status || 'PENDING',
        currentCompany: user.current_company || '',
        currentDesignation: user.current_designation || '',
        graduationYear: user.graduation_year || '',
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Login failed.' });
  }
};

export const getStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.query;
    if (!identifier) {
      res.status(400).json({ status: 'error', message: 'Student identifier (roll number, email or name) is required.' });
      return;
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM students WHERE roll_number = ? OR email = ? OR full_name = ? LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ status: 'error', message: 'Student record not found in database.' });
      return;
    }

    res.status(200).json({
      status: 'success',
      student: rows[0],
    });
  } catch (error: any) {
    console.error('Get Student Profile Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch student profile.' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      role,
      identifier,
      fullName,
      email,
      mobile,
      department,
      address,
      photoUrl,
      admissionNumber,
      collegeName,
      degreeClass,
      joiningYear,
      endingYear,
      studyYear,
      semester,
      dob,
      bloodGroup,
      gender,
      govtIdType,
      govtIdNumber,
      govtIdPhotoUrl,
      collegeDocUrl,
      fatherName,
      fatherPhone,
      fatherEmail,
      fatherPhotoUrl,
      fatherGovtIdType,
      fatherGovtIdNumber,
      motherName,
      motherPhone,
      motherEmail,
      motherPhotoUrl,
      motherGovtIdType,
      motherGovtIdNumber,
      hobbies,
      skills,
      conveyanceMode,
      busRoute,
      busCharges,
      vehicleType,
      parkingPaymentTerm,
      parkingFee,
      residenceType,
      hostelName,
      roomNumber,
      hostelPaymentTerm,
      hostelFee,
      hostelDocUrl,
      hostelCardUrl,
    } = req.body;

    if (!role || !identifier) {
      res.status(400).json({ status: 'error', message: 'Role and user identifier are required.' });
      return;
    }

    if (role === 'Student') {
      const computedClass = degreeClass && department && joiningYear
        ? `${degreeClass.trim()} ${department.trim()} ${joiningYear.trim()}`
        : 'B.TECH CSE 2023 A';

      await pool.query(
        `UPDATE students SET
          full_name = ?, admission_number = ?, college_name = ?, class = ?, degree_class = ?,
          joining_year = ?, ending_year = ?, study_year = ?, semester = ?, department = ?,
          dob = ?, blood_group = ?, gender = ?, photograph_url = ?, email = ?, mobile = ?,
          address = ?, govt_id_type = ?, govt_id_number = ?, govt_id_photo_url = ?,
          college_doc_url = ?, father_name = ?, father_phone = ?, father_email = ?,
          father_photo_url = ?, father_govt_id_type = ?, father_govt_id_number = ?,
          mother_name = ?, mother_phone = ?, mother_email = ?, mother_photo_url = ?,
          mother_govt_id_type = ?, mother_govt_id_number = ?, hobbies = ?, skills = ?,
          conveyance_mode = ?, bus_route = ?, bus_charges = ?, vehicle_type = ?,
          parking_payment_term = ?, parking_fee = ?, residence_type = ?, hostel_name = ?,
          room_number = ?, hostel_payment_term = ?, hostel_fee = ?, hostel_doc_url = ?, hostel_card_url = ?
         WHERE roll_number = ? OR email = ? OR full_name = ?`,
        [
          fullName, admissionNumber, collegeName, computedClass, degreeClass,
          joiningYear, endingYear, studyYear, semester, department,
          dob, bloodGroup, gender, photoUrl || null, email, mobile,
          address, govtIdType, govtIdNumber, govtIdPhotoUrl || null,
          collegeDocUrl || null, fatherName, fatherPhone, fatherEmail,
          fatherPhotoUrl || null, fatherGovtIdType, fatherGovtIdNumber,
          motherName, motherPhone, motherEmail, motherPhotoUrl || null,
          motherGovtIdType, motherGovtIdNumber, hobbies,
          typeof skills === 'object' ? JSON.stringify(skills) : (skills || ''),
          conveyanceMode, busRoute, busCharges || 0, vehicleType,
          parkingPaymentTerm, parkingFee || 0, residenceType, hostelName,
          roomNumber, hostelPaymentTerm, hostelFee || 0, hostelDocUrl || null, hostelCardUrl || null,
          identifier, identifier, identifier
        ]
      );
    } else if (role === 'Faculty') {
      await pool.query(
        `UPDATE faculties SET faculty_name = ?, email = ?, mobile = ?, department = ?, address = ?, photograph_url = ?
         WHERE employee_id = ? OR email = ? OR faculty_name = ?`,
        [fullName, email, mobile, department, address, photoUrl || null, identifier, identifier, identifier]
      );
    } else if (role === 'Parent') {
      await pool.query(
        `UPDATE parents SET parent_name = ?, email = ?, mobile = ?, address = ?
         WHERE email = ? OR student_roll_number = ? OR parent_name = ?`,
        [fullName, email, mobile, address, identifier, identifier, identifier]
      );
    } else if (role === 'Alumni') {
      await pool.query(
        `UPDATE alumni SET full_name = ?, email = ?, mobile = ?, department = ?, address = ?, photograph_url = ?
         WHERE roll_number = ? OR email = ? OR full_name = ?`,
        [fullName, email, mobile, department, address, photoUrl || null, identifier, identifier, identifier]
      );
    } else if (role === 'Administrator') {
      await pool.query(
        `UPDATE administrators SET admin_name = ?, email = ?, mobile = ?, department = ?, address = ?
         WHERE admin_name = ? OR email = ?`,
        [fullName, email, mobile, department, address, identifier, identifier]
      );
    }

    res.status(200).json({
      status: 'success',
      message: `Profile updated and saved in MySQL database for ${role}!`,
      user: {
        name: fullName,
        email,
        mobile,
        department,
        address,
        photoUrl,
      },
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update profile in MySQL.' });
  }
};

export const getRegisteredStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [[sCount]]: any = await pool.query('SELECT COUNT(*) as count FROM students');
    const [[fCount]]: any = await pool.query('SELECT COUNT(*) as count FROM faculties');
    const [[pCount]]: any = await pool.query('SELECT COUNT(*) as count FROM parents');
    const [[aCount]]: any = await pool.query('SELECT COUNT(*) as count FROM alumni');
    const [[adCount]]: any = await pool.query('SELECT COUNT(*) as count FROM administrators');

    const counts = {
      students: sCount.count,
      faculties: fCount.count,
      parents: pCount.count,
      alumni: aCount.count,
      administrators: adCount.count,
    };

    const isHtmlRequested = req.query.format === 'html' || req.headers.accept?.includes('text/html');

    if (isHtmlRequested && req.query.format !== 'json') {
      const total = counts.students + counts.faculties + counts.parents + counts.alumni + counts.administrators || 1;
      const calcPct = (val: number) => Math.round((val / total) * 100);

      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NEXUS | Live User Population Statistics</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              background: #06050e;
              color: #f8fafc;
              padding: 2.5rem 1.5rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              background-image: 
                radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.15), transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.15), transparent 40%);
            }
            .container { max-width: 900px; width: 100%; margin: 0 auto; }
            .header {
              background: rgba(15, 12, 35, 0.8);
              border: 1px solid rgba(168, 85, 247, 0.3);
              border-radius: 2rem;
              padding: 2.5rem;
              backdrop-filter: blur(16px);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
              margin-bottom: 2rem;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.4rem 1rem;
              border-radius: 9999px;
              background: rgba(168, 85, 247, 0.15);
              border: 1px solid rgba(168, 85, 247, 0.3);
              color: #c084fc;
              font-size: 0.75rem;
              font-weight: 800;
              text-transform: uppercase;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 2.25rem;
              font-weight: 900;
              margin-bottom: 0.5rem;
              background: linear-gradient(135deg, #ffffff, #c084fc, #818cf8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            p { color: #94a3b8; font-size: 0.9rem; }
            
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 1.25rem;
              margin-bottom: 2rem;
            }
            .card {
              background: rgba(20, 16, 48, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 1.5rem;
              padding: 1.5rem;
              backdrop-filter: blur(12px);
              transition: transform 0.2s, border-color 0.2s;
            }
            .card:hover { transform: translateY(-4px); border-color: rgba(168, 85, 247, 0.4); }
            .card-title { font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
            .card-val { font-size: 2.5rem; font-weight: 900; color: #ffffff; margin: 0.4rem 0; font-family: 'JetBrains Mono', monospace; }
            .progress-bar { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; overflow: hidden; margin-top: 0.75rem; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #6366f1); border-radius: 999px; }

            .json-box {
              background: rgba(10, 8, 26, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 1.5rem;
              padding: 1.5rem;
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.85rem;
              color: #38bdf8;
              overflow-x: auto;
              white-space: pre-wrap;
              margin-bottom: 2rem;
            }
            .btn-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; }
            .btn {
              padding: 0.6rem 1.25rem;
              border-radius: 1rem;
              font-size: 0.825rem;
              font-weight: 700;
              text-decoration: none;
              color: white;
              background: #9333ea;
              transition: background 0.2s;
            }
            .btn:hover { background: #7e22ce; }
            .btn-outline { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #cbd5e1; }
            .btn-outline:hover { background: rgba(255, 255, 255, 0.15); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">📊 Live Population Metrics</div>
              <h1>NEXUS Registered User Statistics</h1>
              <p>Real-Time User Population Analytics & Role Breakdown fetched directly from MySQL database tables.</p>
              
              <div class="btn-row">
                <a href="http://localhost:5000" class="btn btn-outline">⬅️ Back to Server Control Panel</a>
                <a href="/api/auth/stats?format=json" class="btn">Raw JSON View (?format=json)</a>
              </div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="card-title">🎓 Registered Students</div>
                <div class="card-val">${counts.students}</div>
                <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">${calcPct(counts.students)}% of total users</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${calcPct(counts.students)}%;"></div></div>
              </div>

              <div class="card">
                <div class="card-title">👨‍🏫 Faculty Members</div>
                <div class="card-val">${counts.faculties}</div>
                <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">${calcPct(counts.faculties)}% of total users</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${calcPct(counts.faculties)}%;"></div></div>
              </div>

              <div class="card">
                <div class="card-title">👨‍👩‍👧 Parents Connected</div>
                <div class="card-val">${counts.parents}</div>
                <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">${calcPct(counts.parents)}% of total users</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${calcPct(counts.parents)}%;"></div></div>
              </div>

              <div class="card">
                <div class="card-title">🎓 Alumni Network</div>
                <div class="card-val">${counts.alumni}</div>
                <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">${calcPct(counts.alumni)}% of total users</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${calcPct(counts.alumni)}%;"></div></div>
              </div>

              <div class="card">
                <div class="card-title">🛡️ System Administrators</div>
                <div class="card-val">${counts.administrators}</div>
                <div style="font-size: 0.75rem; color: #a855f7; font-weight: 700;">${calcPct(counts.administrators)}% of total users</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${calcPct(counts.administrators)}%;"></div></div>
              </div>
            </div>

            <div style="font-weight: 800; margin-bottom: 0.75rem; color: #e2e8f0; font-size: 0.95rem;">Raw Response Stream (JSON):</div>
            <div class="json-box">${JSON.stringify({ status: 'success', counts }, null, 2)}</div>
          </div>
        </body>
        </html>
      `);
      return;
    }

    res.status(200).json({
      status: 'success',
      counts,
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
