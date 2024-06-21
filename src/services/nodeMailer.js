import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import hbs from 'nodemailer-express-handlebars'

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'kkeshavkumar1209@gmail.com',
        pass: process.env.password
    }
});
const hbsOptions ={
    viewEngine:{
        defaultLayout: false
    },
    viewPath: 'src/emailTemplates'
}

transporter.use('compile',hbs(hbsOptions))

export function sendEmail({email,subject,template,context,attachments=[]}) {
    console.log(template,subject)
    transporter.sendMail({
        from: '"Pharmacy App Team" <kkeshavkumar1209@gmail.com>',
        to: email,
        subject,
        template,
        context,
        attachments
    });
}
