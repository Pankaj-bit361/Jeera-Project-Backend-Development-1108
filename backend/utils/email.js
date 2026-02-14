import axios from 'axios';

export const sendInviteEmail = async (email, orgName, inviteCode) => {
  const joinLink = `https://jeera-app.com/join?code=${inviteCode}`; // Placeholder frontend URL
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>You've been invited to join ${orgName} on Jeera!</h2>
      <p>Collaborate with your team effectively.</p>
      <p><strong>Invite Code:</strong> ${inviteCode}</p>
      <p>Click the link below to join:</p>
      <a href="${joinLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Now</a>
    </div>
  `;

  try {
    await axios.post('https://hackathon.velosapps.com/api/email/send', {
      to: email,
      subject: `Invitation to join ${orgName}`,
      message: emailBody
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error.message);
    // Don't throw error to prevent blocking the API response
  }
};