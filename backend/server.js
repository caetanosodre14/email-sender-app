require('dotenv').config({ path: __dirname + '/.env' });
console.log('EMAIL_USER:', process.env.EMAIL_USER);
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mondaySdk = require('monday-sdk-js');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const monday = mondaySdk();
monday.setToken(process.env.MONDAY_TOKEN);

let emailsEnviados = [];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function criarItemNoMonday(para, assunto) {
  const query = `
    mutation {
      create_item (
        board_id: ${process.env.BOARD_ID},
        item_name: "Email para ${para}: ${assunto}"
      ) {
        id
      }
    }
  `;
  try {
    const res = await monday.api(query);
    console.log('Item criado no Monday, id:', res.data.create_item.id);
  } catch (error) {
    console.error('Erro ao criar item no Monday:', error);
  }
}

app.post('/send-email', (req, res) => {
  const { para, assunto, mensagem } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: para,
    subject: assunto,
    text: mensagem
  };

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error('Erro ao enviar:', error);
      return res.status(500).json({ success: false, message: 'Erro ao enviar email' });
    } else {
      emailsEnviados.push({ para, assunto, mensagem });
      console.log('Email enviado com sucesso!');

      await criarItemNoMonday(para, assunto);
      return res.json({ success: true, info });
    }
  });
});

app.get('/emails', (req, res) => {
  res.json(emailsEnviados);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});