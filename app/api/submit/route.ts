import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1 MB
const ORGANIZATION_NAME = "Zenesis Foundation";
const DISCLAIMER_TEXT =
  "This is an independently managed private scholarship assistance initiative and is not affiliated with any government authority.";

type AcademicHistoryEntry = {
  previousCollegeName?: string;
  previousUniversityName?: string;
  previousCourseName?: string;
  previousCourseType?: string;
};

type FirstPageData = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  collegeName?: string;
  universityName?: string;
  currentSemester?: string;
  courseName?: string;
  courseType?: string;
  familyYearlyIncome?: string;
  statementOfPurpose?: string;
};

type SecondPageData = {
  accountNumber?: string;
  ifsc?: string;
};

type UploadedFile = {
  name: string;
  type?: string;
  size: number;
  base64: string;
};

type SubmissionPayload = {
  firstPage: FirstPageData;
  academicHistoryEntries?: AcademicHistoryEntry[];
  secondPage: SecondPageData;
  files?: Record<string, UploadedFile | undefined>;
};

function createReferenceId() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `ZEN-${year}${month}${day}-${random}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmissionPayload;

    const { firstPage, academicHistoryEntries, secondPage, files = {} } = body;
    const referenceId = createReferenceId();
    const applicantFullName = [firstPage.firstName, firstPage.middleName, firstPage.lastName]
      .filter(Boolean)
      .join(" ");
    const applicantEmail = firstPage.email?.trim();

    // validate file sizes server-side too
    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    for (const key of Object.keys(files)) {
      const f = files[key];
      if (!f) continue;
      const size = f.size || 0;
      if (size > MAX_FILE_BYTES) {
        return NextResponse.json({ ok: false, error: `${f.name} exceeds 1 MB limit` }, { status: 400 });
      }
      // base64 content expected
      const content = Buffer.from(f.base64.split(",").pop() || "", "base64");
      attachments.push({ filename: f.name, content, contentType: f.type || "application/octet-stream" });
    }

    // build email html
    const academicRows = (academicHistoryEntries || []).map((e) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${e.previousCollegeName || "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${e.previousUniversityName || "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${e.previousCourseName || "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${e.previousCourseType || "-"}</td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f1722; background: #f8fafc; padding:24px;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(2,6,23,0.08);">
          <div style="padding:20px 28px;border-bottom:1px solid #eef2f7;background:linear-gradient(90deg,#0f1722 0%,#374151 100%);color:#fff;">
            <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.2px">Scholarship Application</h1>
            <p style="margin:6px 0 0 0;opacity:0.9;font-size:13px">New submission received</p>
          </div>

          <div style="padding:20px 28px;">
            <section style="margin-bottom:14px;padding:12px 14px;border:1px solid #dbe4ff;background:#f5f7ff;border-radius:10px;">
              <p style="margin:0;font-size:13px;color:#3d2c8d;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Application Reference</p>
              <p style="margin:6px 0 0 0;font-size:18px;color:#111111;font-weight:700;">${referenceId}</p>
            </section>

            <section style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:14px;">
              <div style="flex:1;min-width:240px">
                <h3 style="margin:0 0 6px 0;font-size:13px;color:#0f1722;font-weight:600">Applicant</h3>
                <p style="margin:0;font-size:14px"><strong>Name:</strong> ${applicantFullName}</p>
                <p style="margin:6px 0 0 0;font-size:14px"><strong>Phone:</strong> ${firstPage.phone}</p>
                <p style="margin:6px 0 0 0;font-size:14px"><strong>Email:</strong> ${firstPage.email}</p>
              </div>
              <div style="flex:1;min-width:240px">
                <h3 style="margin:0 0 6px 0;font-size:13px;color:#0f1722;font-weight:600">Course</h3>
                <p style="margin:0;font-size:14px"><strong>College:</strong> ${firstPage.collegeName}</p>
                <p style="margin:6px 0 0 0;font-size:14px"><strong>University:</strong> ${firstPage.universityName}</p>
                <p style="margin:6px 0 0 0;font-size:14px"><strong>Current Semester:</strong> ${firstPage.currentSemester}</p>
                <p style="margin:6px 0 0 0;font-size:14px"><strong>Course:</strong> ${firstPage.courseName} ${firstPage.courseType ? '(' + firstPage.courseType + ')' : ''}</p>
              </div>
            </section>

            <section style="margin-bottom:14px;">
              <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f1722;font-weight:600">Academic History</h3>
              <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #eef2f7">
                <thead>
                  <tr style="background:#f8fafc">
                    <th style="text-align:left;padding:8px 10px;font-size:13px;color:#374151">Institution</th>
                    <th style="text-align:left;padding:8px 10px;font-size:13px;color:#374151">Board/University</th>
                    <th style="text-align:left;padding:8px 10px;font-size:13px;color:#374151">Course/Stream</th>
                    <th style="text-align:left;padding:8px 10px;font-size:13px;color:#374151">Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${academicRows}
                </tbody>
              </table>
            </section>

            <section style="margin-bottom:14px;">
              <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f1722;font-weight:600">Family & Statement</h3>
              <p style="margin:0;font-size:14px"><strong>Family Yearly Income:</strong> ${firstPage.familyYearlyIncome}</p>
              <p style="margin:8px 0 0 0;font-size:14px"><strong>Statement of Purpose:</strong></p>
              <p style="white-space:pre-wrap;margin:6px 0 0 0;font-size:14px;color:#334155">${firstPage.statementOfPurpose}</p>
            </section>

            <section style="margin-bottom:14px;">
              <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f1722;font-weight:600">Bank Details</h3>
              <p style="margin:0;font-size:14px"><strong>Account:</strong> ${secondPage.accountNumber || '-'}</p>
              <p style="margin:6px 0 0 0;font-size:14px"><strong>IFSC:</strong> ${secondPage.ifsc || '-'}</p>
            </section>

            <section style="margin-bottom:18px;">
              <h3 style="margin:0 0 8px 0;font-size:13px;color:#0f1722;font-weight:600">Uploaded Documents</h3>
              <ul style="margin:0;padding-left:18px;color:#0f1722">
                ${Object.keys(files).map(k => `<li style="margin-bottom:6px">${k}: ${files[k] ? files[k].name : 'Not provided'}</li>`).join('')}
              </ul>
            </section>

            <div style="font-size:12px;color:#64748b;padding-top:8px;border-top:1px dashed #e6eef6">This message contains uploaded documents as attachments.</div>
            <div style="margin-top:10px;font-size:12px;color:#64748b;">Disclaimer: ${DISCLAIMER_TEXT}</div>
          </div>
        </div>
      </div>
    `;

    const confirmationHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #111111; background: #f7f7fb; padding: 24px;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 34px rgba(61,44,141,0.12);">
          <div style="padding: 24px 28px; background: linear-gradient(135deg, #3D2C8D 0%, #6D4CFF 55%, #B9A7FF 100%); color: white;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.92;">${ORGANIZATION_NAME}</p>
            <h1 style="margin: 10px 0 0 0; font-size: 24px; line-height: 1.3;">Your scholarship application was received</h1>
          </div>

          <div style="padding: 24px 28px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7;">Hello ${firstPage.firstName || "Applicant"},</p>
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7;">
              Thank you for submitting your scholarship application to ${ORGANIZATION_NAME}. Our team has received your form and supporting documents successfully.
            </p>

            <div style="margin: 20px 0; padding: 18px; border-radius: 14px; border: 1px solid #EAEAF4; background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(185,167,255,0.15));">
              <p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #3D2C8D;">Application Reference ID</p>
              <p style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #111111;">${referenceId}</p>
            </div>

            <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.7;">Please keep this reference ID safe. It can be used for follow-up or verification.</p>
            <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7;">What happens next:</p>
            <ul style="margin: 0 0 16px 18px; padding: 0; color: #334155;">
              <li style="margin-bottom: 8px;">Our team reviews your submitted details and uploaded documents.</li>
              <li style="margin-bottom: 8px;">If anything is missing, the team may contact you using your submitted email or phone number.</li>
              <li style="margin-bottom: 8px;">Verified applications move forward to the next review stage.</li>
            </ul>

            <div style="margin: 18px 0 0 0; padding: 14px 16px; border-radius: 12px; background: #f7f7fb; border: 1px solid #EAEAF4;">
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #5B5680;">
                <strong style="color:#3D2C8D;">Disclaimer:</strong> ${DISCLAIMER_TEXT}
              </p>
            </div>

            <p style="margin: 0; font-size: 15px; line-height: 1.7;">Regards,<br />${ORGANIZATION_NAME}</p>
          </div>
        </div>
      </div>
    `;

    // create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO,
      subject: `Scholarship application ${referenceId}: ${[firstPage.firstName, firstPage.lastName].filter(Boolean).join(' ')}`,
      html,
      attachments,
      replyTo: applicantEmail,
    };

    await transporter.sendMail(mailOptions);

    if (applicantEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: applicantEmail,
        subject: `${ORGANIZATION_NAME} application received - ${referenceId}`,
        html: confirmationHtml,
      });
    }

    return NextResponse.json({ ok: true, referenceId });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
