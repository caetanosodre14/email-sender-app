require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let emailsEnviados = [];

app.post('/send-email', async (req, res) => {
  const { para, assunto, mensagem } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: para,
    subject: assunto,
    text: mensagem
  };

  try {
    await transporter.sendMail(mailOptions);
    emailsEnviados.push({ para, assunto, mensagem });

    await axios.post(
      'https://api.monday.com/v2',
      {
        query: `
          mutation {
            create_item(
              board_id: ${process.env.BOARD_ID},
              item_name: "Email para ${para}",
              column_values: "{\"text\": \"${mensagem}\"}"
            ) {
              id
            }
          }
        `
      },
      {
        headers: {
          Authorization: process.env.MONDAY_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true, message: 'Email enviado com sucesso!' });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar email.' });
  }
});

app.get('/emails', (req, res) => {
  res.json(emailsEnviados);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});