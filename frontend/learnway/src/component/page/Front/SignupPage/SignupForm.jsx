import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

import InputBox from '../Input';
import AuthEamil from './AuthEamil';
import Button from '../../../ui/Button';
import SelectLanguage from '../../../ui/CommonSelectLanguage';
import { useSelector } from 'react-redux';
import { request } from '../utils/axios';
import Alert from '@mui/joy/Alert';

const InputFrame = styled.div`
  width: 20vw;
  height: 6.2vh;
  margin-bottom: 3vh;
`;

const InputTitle = styled.div`
  width: 20vw;
  height: 1.84vh;
  font-size: 0.9vw;
`;



export default function SignupForm({getUserinfo}) {

  // 언어정보 받아오기
  const languageBox = useSelector(state => state.UserInfoReducer)

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState();
  const [pw, setPw] = useState("");
  const [confirmPw, setconfirmPw] = useState(""); 
  const [birthday, setbirthday] = useState("");
  const [languageName, setLanguageName] = useState("KOREAN");  // 초기값 userInfo.languageId로 수정
  const [disabled, setDisabled] = useState(true);
  const [msg, setMsg] = useState("");

  // 이메일 인증이 되면 email 갱신
  const getEmail = (email) => {
    setEmail(email)
  }


  // 닉네임이 중복되지 않으면 들어오면 Next button 활성화
  useEffect(() => {
    if (msg === "사용가능한 닉네임입니다.") {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [msg])
  
  // 닉네임이 변경되면 중복여부 체크
  request("get",`/users/dupName?name=${username}`).then((res) => setMsg(res.msg) )
  

  // form에 값이 다 들어와서 Next Button을 누르면 부모 컴포넌트에 모든 값을 emit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(languageBox)
    
    // 해당 언어 데이터를 정제하기
    const asyncFor =  () => {
      for (let i = 0; i < languageBox.language.length; i++) {
        console.log(i)
        if (languageBox.language[i].name === languageName){
          // console.log(languageBox.language[i])
          return languageBox.language[i]
        }
      }
    }
    const language = asyncFor()

    if (pw === confirmPw) {
      const data = {
        name: username,
        userEmail: email,
        userPwd: pw,
        birthDay: birthday,
        language: language,       // 랭귀지 id  체크
        badUser: false,
        bio: "",
        imgUrl: "",
        providerId: "",
        provider: "",
        userId: 0,
      };
      console.log(data)
      getUserinfo(data)           // 정제된 데이터를 부모 컴포넌트에 보내준다.
        
    }
    else {
      alert("비밀번호가 다릅니다.")
    }
  };

  return(
    <div>
      <AuthEamil getEmail = {getEmail}></AuthEamil>
      <form onSubmit={handleSubmit}>
        <InputBox id="username" type="txt" title="User Name(ENG)" placeholder="hanbin" value={username} onChange={(e) => {setUsername(e.target.value)}}></InputBox>
        <Alert>{msg}</Alert>
        <InputBox id="password" type="password" title="Password" placeholder="********" value={pw} onChange={(e) => {setPw(e.target.value)}}></InputBox>
        <InputBox id="confirmPw" type="password" title="Confirm Password" placeholder="********" value={confirmPw} onChange={(e) => {setconfirmPw(e.target.value)}}></InputBox>
        <InputFrame>
          <InputTitle>Language</InputTitle>
          <SelectLanguage language = {languageName} setLanguage={setLanguageName} width={"21vw"} height={"20px"} />
        </InputFrame>
        <InputBox id="birthday" type="date" title="Birthday" value={birthday} onFocus="(this.type='date')" onChange={(e) => {setbirthday(e.target.value)}}></InputBox>
        <Button id= "0" width="13.16vw" height="5vh" fontSize="0.83vw" textWeight="700" radius="2vh" textValue="Next" disabled= {disabled} />

      </form>
    </div>
  )
}