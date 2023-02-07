import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import ProfileCard from "../../ui/ProfileCard";
import ProfileImg from "../../ui/ProfileImg";
import InputGroup from "../../ui/InputGroup";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

const Friends = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 0.5vw;
    border: solid 1px black;
`;
const FriendNumber = styled.span`
    font-size: 2vh;
    border: solid 1px black;
`;
const Text = styled.span`
    font-size: 1.2vh;
    color: #000000;
`;

function DeleteFriend(friendEmail) {
    // <Stack sx={{ width: "100%" }} spacing={2}>
    //     <Alert severity="warning">
    //         <AlertTitle>Delete Friend</AlertTitle>
    //         <strong>Are you sure you want to delete your friend?</strong>
    //         If you delete a friend, you can no longer request a chat
    //     </Alert>
    //     ;
    // </Stack>;
    alert("Are you sure you want to delete your friend? If you delete a friend, you can no longer request a chat");
    const myInfo = useSelector((state) => state.AuthReducer);
    console.log(myInfo);
    axios
        .delete("api/friend", {
            friendEmail: friendEmail,
            userEmail: myInfo.userEmail,
        })
        .then(function (res) {
            console.log(res.data.msg);
            alert("친구가 삭제되었습니다.");
        })
        .catch(function (error) {
            console.log(error);
        });
}

function GetFriendCnt(userEmail) {
    const [friendCnt, setFriendCnt] = useState("");
    if (friendCnt) {
        axios
            .get("api/friend/count", {
                params: { userEmail: userEmail },
            })
            // handle success
            .then(function (res) {
                console.log("getFriendsNum");
                setFriendCnt(res.data.friendCnt);
            })
            .catch(function (error) {
                console.log(error);
            });
        return friendCnt;
    }
}

function interestRernderer(array) {
    let result = "";
    if (array) {
        for (let i = 0; i < array.length; i++) {
            result += "#" + array[i].field + "  ";
        }
    }

    return result;
}

function Friend(props) {
    const userInfo = props.selectedFriend;
    console.log(userInfo);
    if (userInfo === "") {
        console.log("nothing selected");
        return <ProfileCard width="" />;
    } else {
        return (
            <ProfileCard
                header={
                    <>
                        <ProfileImg src={userInfo.imgUrl} />
                        <Friends>
                            <FriendNumber>
                                {GetFriendCnt(userInfo.userEmail)}
                            </FriendNumber>
                            Friends
                        </Friends>
                        <PersonRemoveIcon
                            onClick={() => DeleteFriend(userInfo.userEmail)}
                            cursor="pointer"
                        />
                    </>
                }
                name={userInfo.name}
                body={
                    <>
                        <InputGroup
                            flex="column"
                            textValue="Email"
                            fontSize="1.5vh"
                            margin="5% 0vw 0vw 0vw"
                            inputWidth="auto"
                            inputHeight="auto"
                            obj={<Text>{userInfo.userEmail}</Text>}
                        ></InputGroup>
                        <InputGroup
                            flex="column"
                            textValue="Birth"
                            fontSize="1.5vh"
                            margin="5% 0vw 0vw 0vw"
                            inputWidth="auto"
                            inputHeight="auto"
                            obj={<Text>{userInfo.birthDay}</Text>}
                        ></InputGroup>

                        <InputGroup
                            flex="column"
                            textValue="Language"
                            fontSize="1.5vh"
                            margin="5% 0vw 0vw 0vw"
                            inputWidth="auto"
                            inputHeight="auto"
                            obj={<Text>{userInfo.language.name}</Text>}
                        ></InputGroup>

                        <InputGroup
                            flex="column"
                            textValue="Bio"
                            fontSize="1.5vh"
                            fontColor="#000000"
                            margin="5% 0vw 0vw 0vw"
                            inputWidth="auto"
                            inputHeight="auto"
                            obj={<Text>{userInfo.bio}</Text>}
                        ></InputGroup>
                        <InputGroup
                            flex="column"
                            textValue="Interests"
                            fontSize="1.5vh"
                            fontColor="#000000"
                            margin="5% 0vw 0vw 0vw"
                            inputWidth="auto"
                            inputHeight="auto"
                            obj={
                                <Text>
                                    {interestRernderer(userInfo.interests)}
                                </Text>
                            }
                        ></InputGroup>
                        <></>
                    </>
                }
            />
        );
    }
}

export default Friend;