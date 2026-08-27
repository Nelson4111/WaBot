import {
    spawn
} from 'child_process'



const sleep = ms =>
new Promise(
    resolve =>
    setTimeout(resolve, ms)
)





let handler = async(
    m,
    {
        conn
    }
)=>{



    if(
        global.cosrentUpdate
    ){

        return m.reply(
            '⚠️ COSRENT UPDATE sedang berjalan.'
        )

    }






    await m.reply(
`⏳ *COSRENT UPDATE DIMULAI*

🔎 Scan katalog RuangCosplay...`
    )







    const process =
    spawn(
        'node',
        [
            'tools/updateCosrent.js'
        ]
    )






    global.cosrentUpdate =
    process







    let buffer = []

    let timer = null

    let finished = false





    async function sendBuffer(){


        if(
            !buffer.length
        )
            return



        const text =
`📄 *COSRENT PROGRESS*

${buffer.join('\n')}`



        buffer = []



        await conn.sendMessage(
            m.chat,
            {
                text
            }
        )

    }







    function addProgress(
        text
    ){


        buffer.push(
            text
        )



        if(
            !timer
        ){


            timer =
            setTimeout(
                async()=>{


                    timer = null


                    await sendBuffer()


                },
                60000
            )

        }

    }









    process.stdout.on(
        'data',
        async(data)=>{


            const logs =
            data
            .toString()
            .split('\n')
            .filter(Boolean)



            for(
                const log of logs
            ){



                if(
                    log.startsWith(
                        'PAGE_PROGRESS'
                    )
                ){



                    addProgress(
                        log
                        .replace(
                            'PAGE_PROGRESS',
                            ''
                        )
                        .trim()
                    )


                }







                if(
                    log.startsWith(
                        'GENERATE_PROGRESS'
                    )
                ){


                    addProgress(
                        '📝 ' +
                        log
                        .replace(
                            'GENERATE_PROGRESS',
                            ''
                        )
                        .trim()
                    )


                }






                // sengaja tidak kirim COSTUME_PROGRESS
                // supaya tidak spam



                if(
                    log.startsWith(
                        'TOTAL_PROGRESS'
                    )
                ){



                    if(timer){

                        clearTimeout(timer)
                        timer = null

                    }



                    await sendBuffer()



                    await conn.sendMessage(
                        m.chat,
                        {
                            text:
`📦 *COSRENT SELESAI*

${log
.replace(
'TOTAL_PROGRESS',
''
)
.trim()}`
                        }
                    )


                }



            }



        }

    )









    process.stderr.on(
        'data',
        async(data)=>{


            const error =
            data
            .toString()
            .trim()



            if(error){


                if(timer){

                    clearTimeout(timer)
                    timer = null

                }


                await sendBuffer()



                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`❌ *COSRENT ERROR*

${error}`
                    }
                )


            }


        }
    )









    process.on(
        'close',
        async(code)=>{



            global.cosrentUpdate =
            null






            if(timer){

                clearTimeout(timer)
                timer = null

            }



            await sendBuffer()






            if(
                code !== 0
            ){



                await conn.sendMessage(
                    m.chat,
                    {
                        text:
`🛑 *COSRENT UPDATE BERHENTI*

Kode:
${code}`
                    }
                )

            }




        }
    )





}





handler.help = [
    'cosupdate'
]



handler.tags = [
    'owner'
]



handler.command =
/^(cosupdate)$/i



handler.owner = true



export default handler