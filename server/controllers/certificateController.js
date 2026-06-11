const PDFDocument = require('pdfkit');
const Registration = require('../models/Registration');
const { format } = require('date-fns');

// @desc    Generate Certificate
// @route   POST /api/certificates/generate
// @access  Private
// @desc    Generate Certificate (AI Driven)
// @route   POST /api/certificates/generate
// @access  Private (Student only for their own)
const generateCertificate = async (req, res) => {
  try {
    const { registrationId } = req.body;
    const registration = await Registration.findById(registrationId)
      .populate('studentId', 'name email')
      .populate({
        path: 'eventId',
        populate: { path: 'clubId', select: 'name' }
      });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Authorization check: only the student themselves
    if (req.user._id.toString() !== registration.studentId._id.toString()) {
       return res.status(403).json({ message: 'Not authorized to generate this certificate' });
    }

    if (registration.attendanceStatus !== 'present') {
      return res.status(400).json({ message: 'Attendance verification required. Please mark your attendance first.' });
    }

    // AI CONTENT GENERATION (Simulated logic for "Success Description")
    if (!registration.certificateDescription) {
        const clubName = registration.eventId.clubId?.name || 'College Administration';
        const AI_TEMPLATES = [
            `This certificate recognizes the outstanding commitment and technical proficiency displayed by ${registration.studentId.name} during the ${registration.eventId.title}. Their active participation in this ${registration.eventId.category || 'event'} organized by ${clubName} exemplifies a drive for continuous learning and excellence.`,
            `Awarded to ${registration.studentId.name} for successful completion of ${registration.eventId.title}. Throughout this engagement with ${clubName}, they demonstrated exceptional growth mindset and collaborative skills essential for modern professional environments.`,
            `CampusConnect honors ${registration.studentId.name} for their dedicated participation in ${registration.eventId.title}. This document validates their immersion in ${registration.eventId.category || 'expert-led'} sessions hosted by ${clubName}, highlighting a significant milestone in their academic and professional journey.`
        ];
        
        // Pick a "random" but consistent template based on ID
        const templateIndex = registration._id.toString().charCodeAt(registration._id.toString().length - 1) % AI_TEMPLATES.length;
        registration.certificateDescription = AI_TEMPLATES[templateIndex];
        registration.certificateIssued = true;
        registration.certificateIssuedDate = new Date();
        await registration.save();
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Certificate_${registration.studentId.name.replace(/\s+/g, '_')}.pdf`
    );

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    doc.pipe(res);

    // PREMIUM DESIGN
    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    
    // Abstract Border Accents (Modern)
    doc.save();
    doc.fillColor('#0F1E25').rect(0, 0, 40, doc.page.height).fill(); // Left solid bar
    doc.fillColor('#18313D').rect(40, 0, 10, doc.page.height).fill(); // Thinner secondary bar
    doc.restore();

    // Corner Accents
    doc.save();
    doc.fillColor('#0F1E25').moveTo(doc.page.width, 0).lineTo(doc.page.width - 150, 0).lineTo(doc.page.width, 150).fill();
    doc.restore();

    // Content Start
    const leftMargin = 100;
    const contentWidth = doc.page.width - 200;

    // Header Logo/Text
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(24).text('CAMPUS CONNECT', leftMargin, 60);
    doc.fillColor('#64748B').fontSize(10).text('OFFICIAL ACADEMIC RECOGNITION', leftMargin, 90);

    // Main Title
    doc.moveDown(4);
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(42).text('CERTIFICATE', leftMargin, 160);
    doc.fillColor('#18313D').font('Helvetica').fontSize(18).text('OF ACHIEVEMENT AND COMPLETION', leftMargin, 210);

    // Context
    doc.moveDown(2);
    doc.fillColor('#64748B').fontSize(14).text('This prestigious recognition is proudly presented to:', leftMargin, 260);

    // Recipient Name
    doc.moveDown(1);
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(36).text(registration.studentId.name.toUpperCase(), leftMargin, 300);

    // Divider
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(leftMargin, 350).lineTo(leftMargin + 400, 350).stroke();

    // AI Content (The Description)
    doc.moveDown(2);
    doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(13).text(registration.certificateDescription, leftMargin, 380, {
      width: contentWidth - 50,
      lineGap: 5,
      align: 'justify'
    });

    // Details Grid
    const footerY = 480;
    
    // Club Name
    const clubName = registration.eventId.clubId?.name || 'College Administration';
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(12).text('ORGANIZATION', leftMargin, footerY);
    doc.fillColor('#64748B').font('Helvetica').fontSize(14).text(clubName, leftMargin, footerY + 20);

    // Event Title
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(12).text('EVENT / WORKSHOP', leftMargin + 250, footerY);
    doc.fillColor('#64748B').font('Helvetica').fontSize(14).text(registration.eventId.title, leftMargin + 250, footerY + 20);

    // Issue Date
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(12).text('DATE OF ISSUE', leftMargin + 500, footerY);
    doc.fillColor('#64748B').font('Helvetica').fontSize(14).text(format(new Date(registration.certificateIssuedDate), 'MMMM dd, yyyy'), leftMargin + 500, footerY + 20);

    // Signature Area
    doc.strokeColor('#0F1E25').lineWidth(0.5).moveTo(doc.page.width - 250, 500).lineTo(doc.page.width - 100, 500).stroke();
    doc.fillColor('#0F1E25').font('Helvetica-Bold').fontSize(10).text('AUTHORIZED SIGNATORY', doc.page.width - 250, 510, { align: 'center', width: 150 });
    
    // Seal/Badge Simulation
    doc.circle(doc.page.width - 175, 120, 40).lineWidth(2).strokeColor('#0F1E25').stroke();
    doc.fontSize(8).text('CERTIFIED', doc.page.width - 205, 115, { align: 'center', width: 60 });
    doc.text('AUTHENTIC', doc.page.width - 205, 125, { align: 'center', width: 60 });

    doc.end();

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
    }
  }
};

module.exports = {
  generateCertificate,
};
