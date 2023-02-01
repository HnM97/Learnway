import React from "react";
import styled from "styled-components";
import Translate from './Translate/Translate';
import Report from './Report/Report';
import CommonFrame from './CommonComponent/CommonFrame'
import Quit from './Quit/Quit'
//화상 채팅방용 테스트 페이지
const Text = styled.span`
    font-size: 4vw;
    font-weight: 800;
    padding: 1vw 0vw 1vw 2vw;

    border:solid 1px black;
`;
function TestPage(){
    return(
        //화상 카메라가 들어갈 영역
        <Quit></Quit>
        //위젯이 들어갈 영역
    );
};
export default TestPage;