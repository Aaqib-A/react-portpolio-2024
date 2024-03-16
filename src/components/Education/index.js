import React from 'react';
import styled from 'styled-components';
import { education } from '../../data/constants';
import EducationCard from '../../components/Cards/EducationCard';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  align-items: center;
  padding: 50px 0px;
`;

const Wrapper = styled.div`
  max-width: 1100px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 600;
  text-align: center;
  margin-top: 12px;
  color: ${({ theme}) => theme.text_primary};

  @media screen and (max-width:480px) {
    margin-size: 12px;
    font-size: 32px;
  }
`;

const Desc = styled.div`
  font-width: 18px;
  max-width: 600px;
  text-align: center;
  color: ${({ theme}) => theme.text_primary};

  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`;

const TimeLineSection = styled.div`
  width:100%;
  max-width: 1000px;
  margin-top: 10px;
  display: flex;
  flex-direction:column;
  align-items: center;
  justify-content: center;
  gap: 12px;

`;

const Education = () => {
  return (
    <Container id="education">
    <Wrapper>
        <Title>Education</Title>
        <Desc>My education has been a journey of discovery, growth, development and exploration of my passion. My education details are as follows.</Desc>
        <TimeLineSection>
          <Timeline>
            {
              education.map((edu, index) => (
                <TimelineItem key="id">
                  <TimelineContent sx={{py:"12px", px:2}}>
                    <EducationCard education={edu}/>
                    {/* <div>H1</div> */}
                  </TimelineContent>
                  <TimelineSeparator>
                    <TimelineDot variant="outlined" color="secondary"/>
                    {
                      index !== education.length -1 && 
                      (<TimelineConnector style={{background:"#854CE6"}} />)
                    }
                  </TimelineSeparator>
                </TimelineItem>
              ))
            }
          </Timeline>
        </TimeLineSection>
    </Wrapper>
  </Container>
  )
}

export default Education;