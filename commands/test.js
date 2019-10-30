const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    const channel = message.channel;
    const author = message.author;
    const filter = m => m.author.id === author.id;
    const guild = message.guild;
    const options = [
        {
            id: 1,
            value: "Report a player",
            channelName: "report_player"
        },
        {
            id: 2,
            value: "Report a bug",
            channelName: "report_bug"
        },
        {
            id: 3,
            value: "Buycraft issues",
            channelName: "buycraft"
        },
        {
            id: 4,
            value: "Manager support",
            channelName: "manager"
        },
        {
            id: 5,
            value: "Staff application",
            channelName: "application"
        },
        {
            id: 6,
            value: "Other support",
            channelName: "other"
        },
    ];

    message.delete();

    let aMOption = new Discord.RichEmbed()
        .addField("Option menu", `
            1. Report a player
            2. Report a bug
            3. Buycraft issues
            4. Manager support
            5. Staff application
            6. Other support
        `)
        .setTitle("Ticket creation")
        .setColor('0x1178F2')
        .attachFile('./logo.png')
        .setAuthor("ShinyMC Tickets", 'attachment://logo.png');
    // .setFooter("This request is closing in 20 seconds.");

    await channel.send(aMOption)
        .then(m => aMOption = m);

    return;

    const aMOptionRes = await setDialogue(filter, channel, 20000);

    switch (aMOptionRes) {
        case 1:
            return channel.send("Request cancelled.")
                .then(m => m.delete(5000))
                .then(() => aMOption.delete());
        case 2:
            return channel.send("Time exceeded.")
                .then(m => m.delete(5000))
                .then(() => aMOption.delete());
    }

    aMOption.delete();
    aMOptionRes.delete();

    if (!isFinite(aMOptionRes)) return channel.send("Choose a number, try again.").then(m => m.delete(5000));

    let aMTitleRes;
    let option;

    if (aMOptionRes.content == 6) {
        await channel.send("Enter a title.\n*This request is closing in 30 seconds.*")
            .then(m => aMTitle = m);

        aMTitleRes = await setDialogue(filter, channel, 30000);

        switch (aMTitleRes) {
            case 1:
                return channel.send("Request cancelled.")
                    .then(m => m.delete(5000))
                    .then(() => aMTitle.delete());
            case 2:
                return channel.send("Time exceeded.")
                    .then(m => m.delete(5000))
                    .then(() => aMTitle.delete());
        }

        aMTitle.delete();
        aMTitleRes.delete();

        aMTitleRes = aMTitleRes.content;
        option = options.filter(option => option.id === parseInt(aMOptionRes.content, 10));
        option = option[0];
    } else if (!options.filter(option => option.id === parseInt(aMOptionRes.content, 10))) {
        return channel.send("Choose a number from the list, try again.").then(m => m.delete(5000));
    } else {
        option = options.filter(option => option.id === parseInt(aMOptionRes.content, 10));
        option = option[0];
        aMTitleRes = option.value;
    }

    let aMDesc;

    await channel.send("Enter short description.\n*This request is closing in 30 seconds.*")
        .then(m => aMDesc = m);

    const aMDescRes = await setDialogue(filter, channel, 30000);

    switch (aMDescRes) {
        case 1:
            return channel.send("Request cancelled.")
                .then(m => m.delete(5000))
                .then(() => aMDesc.delete());
        case 2:
            return channel.send("Time exceeded.")
                .then(m => m.delete(5000))
                .then(() => aMDesc.delete());
    }

    aMDesc.delete();
    aMDescRes.delete();

    //channel.send(`Your(${author.username}) input was: \`${option.id}\`, \`${aMTitleRes}\`, \`${aMDescRes.content}\``);

    let randomInt = getRandomInt(0, 99999);
    let tCategory = guild.channels.get("634161959209664533");
    let tInfo;
    let tChannel;

    try {
        tChannel = await guild.createChannel(
            `${option.channelName}-${randomInt}`,
            {
                type: "text",
                topic: `Ticket created by ${author.username}#${author.discriminator}`,
                parent: tCategory
            }
        );

        await channel.send(`New ticket created as ${tChannel} for ${author}.`)
            .then(m => {
                m.delete(5000);
            });
    } catch (e) {
        console.log(e);
        return channel.send(`Something went wrong with creating your ticket. Try again later ${author}.`);
    }

    tInfo = tEmbed = new Discord.RichEmbed()
        .setColor('0x1178F2')
        .attachFile('./logo.png')
        .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
        .setTitle(`${author.username}#${author.discriminator} has created a new ticket.`)
        .addField("Title", aMTitleRes)
        .addField("Description", aMDescRes.content);

    await tChannel.send(tInfo)
        .then(m => tInfo = m);

    switch (option.id) {
        case 1:
            await tReportPlayer(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
        case 2:
            await tReportBug(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
        case 3:
            await tBuycraft(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
        case 4:
            await tManager(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
        case 5:
            await tApplication(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
        case 6:
            await tOther(tInfo, tChannel, author, option)
                .then(() => {

                })
                .catch((e) => {

                });
            break;
    }
}

async function setDialogue(f, c, t) {
    return new Promise(async (resolve, reject) => {
        await c.awaitMessages(f, {
            max: 1,
            time: t
        })
            .then(collected => {
                let f = collected.first();

                if (f.content.toLowerCase() === "-cancel") reject(1);

                resolve(f);
            })
            .catch(e => {
                reject(2);
            });
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function tReportPlayer(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pSuspected;
    let pInformer;
    let pEvidence;
    let pViolation;
    let pDescription;

    return new Promise(async (resolve, reject) => {
        c.send("Which player do you want to report?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pSuspected = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pInformer = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("What is he suspected of?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pEvidence = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Describe what happened?\n\n*This request is closing in 60 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 60000)
            .then(m => pViolation = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Provide some proof?\n\n*This request is closing in 60 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 60000)
            .then(m => pDescription = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("Suspected", pSuspected)
            .addField("Informer", pInformer)
            .addField("Evidence", pEvidence)
            .addField("Violation", pViolation)
            .setTimestamp()
            .addField("Description", pDescription);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        Suspected: ${pSuspected}\n
                        Informer: ${pInformer}\n
                        Evidence: ${pEvidence}\n
                        Violation: ${pViolation}\n
                        Description: ${pDescription}
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}

async function tReportBug(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pIGN;
    let pDescription;
    let pServer;

    return new Promise(async (resolve, reject) => {
        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pIGN = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Which bug do you want to report?\n\n*This request is closing in 45 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 45000)
            .then(m => pDescription = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Which server?\n\n*This request is closing in 60 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 60000)
            .then(m => pServer = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setTimestamp()
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("IGN", pIGN)
            .addField("Description", pDescription)
            .addField("Server", pServer);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        IGN: ${pIGN}\n
                        Description: ${pDescription}\n
                        Server: ${pServer}
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}

async function tBuycraft(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pIGN;
    let pDescription;
    let pDate;
    let pTransaction;

    return new Promise(async (resolve, reject) => {
        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pIGN = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("What’s your issue with the BuyCraft?\n\n*This request is closing in 60000 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 60000)
            .then(m => pDescription = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Date of purchase (in your mail if you didn’t receive the mail fill in: -)\n\n*This request is closing in 2 minutes.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 120000)
            .then(m => pDate = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Transaction ID (in your mail if you didn’t receive the mail fill in: -):\n\n*This request is closing in 2 minutes.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 120000)
            .then(m => pTransaction = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setTimestamp()
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("IGN", pIGN)
            .addField("Description", pDescription)
            .addField("Date", pDate)
            .addField("Transaction ID", pTransaction);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        IGN: ${pIGN}\n
                        Description: ${pDescription}\n
                        Date: ${pDate}\n
                        Transaction ID: ${pTransaction}
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}

async function tManager(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pIGN;
    let pDescription;

    return new Promise(async (resolve, reject) => {
        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pIGN = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("How can we assist you?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pDescription = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setTimestamp()
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("IGN", pIGN)
            .addField("Description", pDescription);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        IGN: ${pIGN}\n
                        Description: ${pDescription}
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}

async function tApplication(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pIGN;
    let pFirstName;
    let pAge;
    let pExperience;
    let pWhy;
    let pWhat;
    let pOther;

    return new Promise(async (resolve, reject) => {
        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pIGN = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("First name?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pFirstName = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Age?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pAge = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Do you have experience as a staff member?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pExperience = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Why do you want to become a staff member?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pWhy = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("What can you bring to our server?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pWhat = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("Anything else you want to tell?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pOther = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setTimestamp()
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("IGN", pIGN)
            .addField("First name", pFirstName)
            .addField("Age", pAge)
            .addField("Experience", pExperience)
            .addField("Why", pWhy)
            .addField("What I can bring", pWhat)
            .addField("Other", pOther);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        IGN: ${pIGN}\n
                        First name: ${pFirstName}\n
                        Age: ${pAge}\n
                        Experience: ${pExperience}\n
                        Why: ${pWhy}\n
                        What I can bring: ${pWhat}\n
                        Other: ${pOther}\n
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}

async function tOther(i, c, u, o) {
    const f = m => m.author.id === u.id;
    let mTemp;

    let pIGN;
    let pDescription;

    return new Promise(async (resolve, reject) => {
        c.send("What's your IGN?\n\n*This request is closing in 30 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 30000)
            .then(m => pIGN = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        c.send("How can we assist you?\n\n*This request is closing in 90 seconds.*")
            .then(m => mTemp = m);

        await setDialogue(f, c, 90000)
            .then(m => pDescription = m)
            .then(m => m.delete())
            .then(m => mTemp.delete())
            .catch(e => {
                switch (e) {
                    case 1:
                        return c.send("Request cancelled.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed because you cancelled the process.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed because user cancelled.`);
                                reject();
                            });
                    case 2:
                        return c.send("Time exceeded.")
                            .then(u.createDM()
                                .then(d => d.send(`Your ticket(${c.name}) has been closed due no response.`))
                                .catch(e => console.log(`DM couldn't be created for ${u.username}#${u.discriminator}`))
                            )
                            .then(() => {
                                c.delete(`Ticket named ${c.name} has been removed due no reponse.`);
                                reject();
                            });
                };
            });

        const nInfo = new Discord.RichEmbed()
            .setColor('0x1178F2')
            .attachFile('./logo.png')
            .setTimestamp()
            .setAuthor("ShinyMC Tickets", 'attachment://logo.png')
            .setTitle(`${u.username}#${u.discriminator} has created a new ticket.`)
            .addField("Option", o.value)
            .addField("IGN", pIGN)
            .addField("Description", pDescription);

        i.edit(nInfo)
            .catch(e => {
                try {
                    c.send(`
                        IGN: ${pIGN}\n
                        Description: ${pDescription}
                    `, {
                        split: true
                    });
                } catch (e) {
                    console.log(`Could not post message in channel ${c.name}.`);
                    reject();
                }
                console.log(`Ticket could not be edited at ${c.name}.`);
            });

        resolve();
    });
}