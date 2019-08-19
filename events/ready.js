module.exports = (client) => {
    let usercount = 0;
    
    for(i = 0; i < client.guilds.size; i++){ 
        usercount += client.guilds.array()[i].memberCount;
    }

    console.log(`Logged in as ${client.user.tag} and looking at ${usercount} users(${client.guilds.size} guilds). `
        + `Shard ID: ${(client.shard.id + 1)}/${client.shard.count}.`);

    client.user.setActivity(`${usercount} users`, { type: 'WATCHING' })

    console.log("====================")

};
