import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async(req, res) => {
    res.status(200).send({
        message: 'Hello from CodeX!'
    })
})

// training the model
app.post('/train', async(req, res) => {
    try {
        const prompt = req.body.prompt;
        const response = await openai.createFineTune({
            training_file: "https://raw.githubusercontent.com/ParthJadhav/Twitter-Data-Analysis/master/Text%20Generation%20using%20GPT-2/data.txt",
            prompt: `${prompt}`,
            model: "text-davinci-003",
            // model: "gpt-3.5-turbo",
            max_tokens: 3000,
            epochs: 1,
            n: 1,
            batch_size: 1,
            learning_rate: 0.0001,
            validation_split: 0,
            validation_every_n_epochs: 1,
            save_every_n_epochs: 1,
            adafactor: true,
            // callback_url: "http://localhost:5002/callback",
        });

        // check if the response status
        if (response.status !== 200) {
            throw new Error(response.statusText);
        } else {
            res.status(200).send({
                message: 'Model trained successfully!'
            });
        }

    } catch (error) {
        console.error(error)
    }
});

app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            // model: "gpt-3.5-turbo",
            prompt: `${prompt}`,
            temperature: 0, // Higher values means the model will take more risks.
            max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
            presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
        });

        // check if the response status
        if (response.status !== 200) {
            throw new Error(response.statusText);
        } else {

            res.status(200).send({
                bot: response.data.choices[0].text
            });
        }

    } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
    }
})

app.listen(5002, () => console.log('AI server started on http://localhost:5002'))