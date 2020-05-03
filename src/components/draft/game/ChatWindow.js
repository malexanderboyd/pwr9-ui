import React, {Fragment, useState} from "react"
import {Feed, Label, Segment, Divider, Input, Form} from 'semantic-ui-react'


const ChatWindow = (props) => {

    let {content, socket} = props

    let [UserMessage, setUserMessage] = useState("")
    let [Author, setAuthor] = useState("Magic Player")

    return (
            <Fragment>
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
                    <Form
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
                    <Form.Input
                        fluid
                        onChange={(e) => {
                            setAuthor(e.target.value)
                        }}
                        value={Author}
                        type="text"
                        placeholder={"Player name"}/>
                        <Form.Input
                            fluid
                            onChange={(e) => {
                                setUserMessage(e.target.value)
                            }}
                            value={UserMessage}
                            type="text"
                            placeholder={"Type a message"}/>
                        <Form.Button primary>Send</Form.Button>
                    </Form>

            </Fragment>
    )
}


export {ChatWindow}