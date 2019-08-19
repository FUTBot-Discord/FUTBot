const DBL = require("dblapi.js");

module.exports = (client) => {
    let usercount = 0;
    const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyMDY5NDYxMjA4MDMyODcwOSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTQ3NjMyOTU2fQ.Q8mbinEz3TtHhK3rU5WVVou3qyiirBohq9WR2MsPWJc', client);
    
    for(i = 0; i < client.guilds.size; i++){ 
        usercount += client.guilds.array()[i].memberCount;
    }

    console.log(`Logged in as ${client.user.tag} and looking at ${usercount} users(${client.guilds.size} guilds). `
        + `Shard ID: ${(client.shard.id + 1)}/${client.shard.count}.`);

    client.user.setActivity(`${client.guilds.size} servers`, { type: 'WATCHING' });
    dbl.postStats(client.guilds.size);

    setInterval(() => {
        dbl.postStats(client.guilds.size);
        client.user.setActivity(`${client.guilds.size} servers`, { type: 'WATCHING' });
    }, 1800000)


    console.log("====================")

};
