const express = require('express'); 

const axios = require('axios')

const redis = require('redis')

const app = express(); 


const PORT = process.env.PORT || 4000 

const client = redis.createClient()

client.on('connect', () => {
    console.log('Redis server connected');
})

app.get('/', (req, res) => {
    res.send('home route is working')
})


const cache = (req, res, next) => {
    const { username } = req.params; 
    client.get(username, (err, repos) => {
        if(err) throw err;
        res.send(setResponse(username, repos))
    })
}

const setResponse = (username, repos) => {
    return `<h3>${username} has ${repos} Github repos</h3>`
}


const getRepos = (req, res) => {
    console.log('getting repos');
    const { username } = req.params; 
    // console.log(username);
    axios.get(`https://api.github.com/users/${username}`)
        .then(response => {

            const repos = response.data.public_repos;
            // console.log(repos, 'repos');
            
            res.send(setResponse(username, repos))
            client.setex(username, 3600, repos)
        })
        .catch(err => {
            console.log(err, 'err');
        })
    // res.send(res)
}

app.get('/repos/:username', cache, getRepos)

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})