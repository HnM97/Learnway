import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import lottie from "lottie-web";
import data from './animation/BGTop.json';

const AniImg = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top : -200px;
`;

const Wrapper = styled.div`
    width: 60%;
    height: 90%;
    text-align: center;
    right: 0px;
    top: 0px;
    overflow: hidden;
    position: absolute;
    z-index : -1;
`;

function BGTopAnimation(){
    const aniBox = useRef();

    useEffect(()=>{
        lottie.loadAnimation({
            container : aniBox.current,
            renderer : 'svg',
            loop: true,
            autoplay : true,
            animationData : data,
        })

    },[]);

    return(
        <Wrapper>
            <AniImg ref={aniBox}></AniImg>
        </Wrapper>
    );
};

export default BGTopAnimation;