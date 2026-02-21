// ──────────────────────────────────────────────
// SportsHub Email Templates with Branding
// ──────────────────────────────────────────────

const LOGO_URL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/logo.png`;

// Shared wrapper that includes the SportsHub logo header and footer
const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SportsHub</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #1d2132; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); overflow: hidden; }
    .logo-header { background-color: #1d2132; padding: 24px; text-align: center; }
    .logo-header img { height: 48px; width: auto; margin-bottom: 8px; }
    .logo-header h2 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .body-content { padding: 32px 28px; }
    .body-content p { color: #444; line-height: 1.7; margin-bottom: 14px; font-size: 15px; }
    .highlight-box { background-color: #f3f0ff; border-left: 4px solid #7758e2; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    .highlight-box p { margin: 4px 0; color: #1d2132; font-weight: 500; }
    .cta-button { display: inline-block; background-color: #7758e2; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .info-label { color: #888; font-size: 13px; margin-bottom: 2px; }
    .info-value { color: #1d2132; font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .email-footer { background-color: #1d2132; padding: 20px 28px; text-align: center; border-top: 1px solid #2a2f45; }
    .email-footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
    .email-footer a { color: #7758e2; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo-header">
      <img src="${LOGO_URL}" alt="SportsHub Logo" />
      <h2>SPORTSHUB</h2>
    </div>
    <div class="body-content">
      ${bodyContent}
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} SportsHub. All rights reserved.</p>
      <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

// ── Player sends request to join a team → Notify Team Manager ──
export const playerRequestToTeamHtml = (managerName, playerName, teamName) =>
  emailWrapper(`
    <p>Hello, <strong>${managerName}</strong></p>
    <p>You have received a new join request for your team!</p>
    <div class="highlight-box">
      <p class="info-label">Player</p>
      <p class="info-value">${playerName}</p>
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
    </div>
    <p>Please log in to your SportsHub dashboard to review and respond to this request.</p>
    <p style="color: #888; font-size: 13px;">You can accept or decline the request from the Team Requests section.</p>
  `);

// ── Team sends request to a player → Notify Player ──
export const teamRequestToPlayerHtml = (playerName, teamName, managerName) =>
  emailWrapper(`
    <p>Hello, <strong>${playerName}</strong></p>
    <p>Great news! You have received an invitation to join a team on SportsHub.</p>
    <div class="highlight-box">
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Invited by</p>
      <p class="info-value">${managerName}</p>
    </div>
    <p>Log in to your SportsHub account to accept or decline this invitation.</p>
    <p style="color: #888; font-size: 13px;">This invitation will remain pending until you take action.</p>
  `);

// ── Request accepted → Notify sender (they are now part of the team) ──
export const requestAcceptedHtml = (recipientName, teamName, role) =>
  emailWrapper(`
    <p>Hello, <strong>${recipientName}</strong></p>
    <p>🎉 Congratulations! Your request has been <span style="color: #16a34a; font-weight: 700;">accepted</span>.</p>
    <div class="highlight-box">
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #16a34a;">✅ Accepted — You are now part of the team!</p>
    </div>
    <p>You can now view your team details, upcoming matches, and more from your dashboard.</p>
  `);

// ── Request accepted → Notify receiver (the acceptor) that player joined ──
export const playerJoinedTeamNotifyHtml = (managerName, playerName, teamName) =>
  emailWrapper(`
    <p>Hello, <strong>${managerName}</strong></p>
    <p>A new player has joined your team!</p>
    <div class="highlight-box">
      <p class="info-label">Player</p>
      <p class="info-value">${playerName}</p>
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #16a34a;">✅ Now a team member</p>
    </div>
    <p>You can manage your team roster from the SportsHub dashboard.</p>
  `);

// ── Request rejected → Notify sender ──
export const requestRejectedHtml = (recipientName, teamName) =>
  emailWrapper(`
    <p>Hello, <strong>${recipientName}</strong></p>
    <p>We wanted to let you know that your request has been <span style="color: #dc2626; font-weight: 700;">declined</span>.</p>
    <div class="highlight-box">
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #dc2626;">❌ Request Declined</p>
    </div>
    <p>Don't worry — there are many other teams on SportsHub. Keep exploring and you'll find the right fit!</p>
  `);

// ── Player directly added to team → Notify Player ──
export const playerAddedToTeamHtml = (playerName, teamName, managerName) =>
  emailWrapper(`
    <p>Hello, <strong>${playerName}</strong></p>
    <p>🎉 You have been added to a team on SportsHub!</p>
    <div class="highlight-box">
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Added by</p>
      <p class="info-value">${managerName}</p>
    </div>
    <p>You are now an official member of <strong>${teamName}</strong>. Log in to see your team details and upcoming events.</p>
  `);

// ── Player removed from team → Notify Player ──
export const playerRemovedFromTeamHtml = (playerName, teamName) =>
  emailWrapper(`
    <p>Hello, <strong>${playerName}</strong></p>
    <p>We wanted to inform you that you have been removed from a team.</p>
    <div class="highlight-box">
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #dc2626;">Removed from team</p>
    </div>
    <p>If you believe this was a mistake, please contact the team manager. You can also explore and join other teams on SportsHub.</p>
  `);

// ── Player left team → Notify Manager ──
export const playerLeftTeamHtml = (managerName, playerName, teamName) =>
  emailWrapper(`
    <p>Hello, <strong>${managerName}</strong></p>
    <p>A player has left your team.</p>
    <div class="highlight-box">
      <p class="info-label">Player</p>
      <p class="info-value">${playerName}</p>
      <p class="info-label">Team</p>
      <p class="info-value">${teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #f59e0b;">Left the team</p>
    </div>
    <p>You can find and invite new players from the SportsHub player directory.</p>
  `);

// ── OTP Verification (with logo) ──
export const verificationEmailWithLogoHtml = (name, otp) =>
  emailWrapper(`
    <p>Hello, <strong>${name}</strong></p>
    <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div class="highlight-box" style="text-align: center;">
      <p class="info-label">Your Verification Code</p>
      <p style="font-size: 36px; font-weight: 700; color: #7758e2; letter-spacing: 8px; margin: 12px 0 4px 0;">${otp}</p>
      <p class="info-label">Valid for 5 minutes</p>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p style="color: #888; font-size: 13px;">If you did not create an account on SportsHub, please ignore this email.</p>
  `);

// ── Forgot Password (with logo) ──
export const forgotPasswordWithLogoHtml = (name, url) =>
  emailWrapper(`
    <p>Hello, <strong>${name}</strong></p>
    <p>We received a request to reset the password for your SportsHub account.</p>
    <div class="highlight-box">
      <p class="info-label">Action Required</p>
      <p class="info-value">Password Reset</p>
      <p class="info-label">Expires in</p>
      <p class="info-value">5 minutes</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${url}" class="cta-button" style="color: #ffffff !important;">Reset My Password</a>
    </div>
    <p style="color: #888; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `);

// ── Request cancelled → Notify receiver ──
export const requestCancelledHtml = (recipientName, senderName, teamName, requestType) =>
  emailWrapper(`
    <p>Hello, <strong>${recipientName}</strong></p>
    <p>A pending request has been cancelled.</p>
    <div class="highlight-box">
      <p class="info-label">${requestType === "PLAYER_TO_TEAM" ? "Player" : "Team"}</p>
      <p class="info-value">${requestType === "PLAYER_TO_TEAM" ? senderName : teamName}</p>
      <p class="info-label">Status</p>
      <p class="info-value" style="color: #f59e0b;">Request Cancelled</p>
    </div>
    <p style="color: #888; font-size: 13px;">No action is needed from your side.</p>
  `);

// ── Organizer authorized by admin → Notify Organizer ──
export const organizerAuthorizedHtml = (organizerName) =>
  emailWrapper(`
    <p>Hello, <strong>${organizerName}</strong></p>
    <p>🎉 Great news! Your organizer account on SportsHub has been <span style="color: #16a34a; font-weight: 700;">authorized</span> by our admin team.</p>
    <div class="highlight-box">
      <p class="info-label">Account Status</p>
      <p class="info-value" style="color: #16a34a;">✅ Authorized</p>
    </div>
    <p>You can now create and manage tournaments on SportsHub. Head over to your dashboard to get started!</p>
    <p style="color: #888; font-size: 13px;">Thank you for being part of SportsHub.</p>
  `);
