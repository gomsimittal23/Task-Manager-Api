const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'gomsimittal23@gmail.com',
    subject: `Welcome ${name} !!`,
    text: `Hi, ${name}, welcome to the task manager app. Now you can easily manage your tasks with just a click.`
  })
}

const sendGoodbyeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'gomsimittal23@gmail.com',
    subject: `Thank you ${name}`,
    text: `We are extremely thankful to you for taking the ride with us. Please provide a feedback about aur task manager app.`
  })
}

module.exports = {
  sendWelcomeMail,
  sendGoodbyeMail
}