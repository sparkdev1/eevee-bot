const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect('mongodb+srv://spark2x:FH8UljIyKXuZB4vM@cluster0.h4s7e.mongodb.net/eevee?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Successfully connected to MongoDB')
        // Create a new client instance
    const client = new Client({
        intents: [
            Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES
        ]
    });

    return client
}

module.exports.connect = connect