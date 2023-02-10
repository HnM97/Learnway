import React, { useState } from "react";
import styled from "styled-components";
import FriendList from "./FriendList";
import Profile from "./Profile";
import Friend from "./Friend";
import Study from "./Study";
import StudyScripts from "./StudyScripts";
import EditProfile from "./EditProfile";
import NameTag from "../../ui/NameTag";

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    justify-content: center;
    align-items: center;
    margin-right: 20%;
    margin-left: 20%;
`;
const Subtitle = styled.div`
    margin-left: 20px;
    /* margin-bottom: 3vh; */
    /* margin-top: 10vh; */
    font-weight: 300px;
    font-size: 2em;
    display: flex;
    align-items: center;
`;
const Side = styled.div`
    margin-left: 1vw;
    margin-right: 1vw;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
`;

function MyPageContent(props) {
    const selectedContent = props.content;

    // FRIENDS Tab - Friend 프로필과 FriendList연결 변수와 함수
    const [selectedFriend, setSelectedFriend] = useState("");
    const handleSelectedFriend = (data) => {
        setSelectedFriend(data);
    };

    // STUDY Tab - Calendar과 StudyScripts연결 변수와 함수
    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleSelectedDate = (date) => {
        setSelectedDate(date);
    };

    const Tab = {
        PROFILE: {
            subtitle: ["Profile", "Edit Profile"],
            child: [<Profile />, <EditProfile />],
        },
        FRIENDS: {
            subtitle: ["Friend", "Friends List"],
            child: [
                <Friend selectedFriend={selectedFriend} />,
                <FriendList handleSelectedFriend={handleSelectedFriend} />,
            ],
        },
        STUDY: {
            subtitle: ["Calendar", "Scripts"],
            child: [
                <Study handleSelectedDate={handleSelectedDate} />,
                <StudyScripts selectedDate={selectedDate} />,
            ],
        },
    };

    return (
        <ContentWrapper>
            <Side>
                <Subtitle>

                <NameTag subtitle={Tab[`${selectedContent}`].subtitle[0]} />
                </Subtitle>
                {Tab[`${selectedContent}`].child[0]}
            </Side>
            <Side>
                <Subtitle>

                <NameTag subtitle={Tab[`${selectedContent}`].subtitle[1]} />
                </Subtitle>
                {Tab[`${selectedContent}`].child[1]}
            </Side>
        </ContentWrapper>
    );
}
export default MyPageContent;
