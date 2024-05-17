import nodemailer from 'nodemailer';
import User from "@/models/usermodels";
import bcryptjs from 'bcryptjs';

export const sendEmail = async({email,emailType,userId}:any)=>{
    try{
      const hashedToken = await bcryptjs.hash(userId.toString(),10)  

        if(emailType==="VERIFY"){
          await User.findByIdAndUpdate(userId,
          {verifyToken:hashedToken,verifyTokenExpiry:Date.now()+3600000})
        }else if(emailType==="RESET"){
          await User.findByIdAndUpdate(userId,
            {forgotPasswordToken:hashedToken,forgotPasswordTokenExpiry:Date.now()+3600000})
        }


        let transport = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: process.env.MAILTRAP_USER, // 
            pass: process.env.MAILTRAP_PASS //
          }
        });

        const mailOption = {
            from: 'abhinav@abhinav.ai', // sender address
            to: email, // list of receivers
            subject: emailType==='VERIFY'?"Verify your email":"Reset your password", // Subject line
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`, // html body
          }
         return await transport.sendMail(mailOption);  
    }catch(error:any){
        throw new Error(error.message)
    }
}