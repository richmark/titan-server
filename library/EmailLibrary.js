const oNodeMailer = require('nodemailer');

exports.setEmailOptions = ({ email, subject, text, html }) => {
	return {
		from: `Titan Supertools <${process.env.EMAIL_USERNAME}>`,
		to: email,
		subject: subject,
		text: text,
		html: html
	};
};

exports.getTransporter = () => {
	return oNodeMailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		pool: true,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		}
	});
};
