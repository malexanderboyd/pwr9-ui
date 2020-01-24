import React, {useState} from "react"
import {Feed, Label, Segment, Divider, Input } from 'semantic-ui-react'


const ChatWindow = (props) => {

    let {content, socket} = props

    let [UserMessage, setUserMessage] = useState("")
    let [Author, setAuthor] = useState("Magic Player")

    return (
            <Segment raised style={{color: "black"}}>
                <Label color='red' ribbon={"right"}>
                    Chat
                </Label>
                <Feed size={"small"} style={{height: "10vh", overflow: "auto"}}>
                {Object.entries(content).map(([timestamp, details])=>{

                    const {author, message} = details

                    return (
                        <div>
                            <Feed.Event
                                key={timestamp}
                                content={`<${author}>: ${message}`}>
                            </Feed.Event>
                        </div>
                    )
                })
                }
                </Feed>
                <Divider/>
                <Label>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            socket.send(
                                JSON.stringify({
                                    type: "chat_message",
                                    data: JSON.stringify({
                                        author: Author,
                                        message: UserMessage
                                    })
                                })
                            )
                        }}>
                    <Input
                        onChange={(e) => {
                            setUserMessage(e.target.value)
                        }}
                        value={UserMessage}
                        type="text"
                        placeholder={"Player name"}/>
                    </form>
                </Label>
                    <Input
                        onChange={(e) => {
                            setAuthor(e.target.value)
                        }}
                        value={Author}
                        type="text"
                        placeholder={"Player name"}/>
            </Segment>
    )
}


export {ChatWindow}