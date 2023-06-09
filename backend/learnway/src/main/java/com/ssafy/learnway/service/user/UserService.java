package com.ssafy.learnway.service.user;

import com.ssafy.learnway.domain.Interest;
import com.ssafy.learnway.domain.Language;
import com.ssafy.learnway.domain.RefreshToken;
import com.ssafy.learnway.domain.user.User;
import com.ssafy.learnway.domain.user.UserInterest;
import com.ssafy.learnway.dto.interest.InterestDto;
import com.ssafy.learnway.dto.language.LanguageDto;
import com.ssafy.learnway.dto.user.*;
import com.ssafy.learnway.exception.TokenValidFailedException;
import com.ssafy.learnway.exception.UserNotFoundException;
import com.ssafy.learnway.repository.interest.InterestRepository;
import com.ssafy.learnway.repository.language.LanguageRepository;
import com.ssafy.learnway.repository.user.RefreshTokenRepository;
import com.ssafy.learnway.repository.user.UserInterestRepository;
import com.ssafy.learnway.repository.user.UserRepository;
import com.ssafy.learnway.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    private final UserInterestRepository userInterestRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtTokenProvider jwtTokenProvider;

    private final RefreshTokenRepository refreshTokenRepository;

    private final InterestRepository interestRepository;

    private final LanguageRepository languageRepository;

    private final S3FileUploadService s3FileUploadService;

    @Transactional
    public TokenDto login(String userEmail, String userPwd) throws SQLException {

        User user = userRepository.findByUserEmail(userEmail);

        // 장소에서 가져온 인코딩된 암호(encodedPassword)가 인코딩 된 후 제출된 원시 암호(raw password)와 일치하는지 확인
        // 불일치하면 확인 msg 반환.
        if (user == null || !passwordEncoder.matches(userPwd, user.getPassword()) ) {
            throw new SQLException();
        }

        // 유저 정보와 유저 권한이 담긴 token 생성. UserNamePasswordAuthentication Token 생성
        // String token = jwtTokenProvider.createToken(String.valueOf(user.getUserId()), user.getRoles());

        // AccessToken, RefreshToken 발급
        TokenDto tokenDto = jwtTokenProvider.createTokenDto(user.getUserId(),user.getRoles());

        RefreshToken refreshToken = RefreshToken.builder()
                .userKey(user.getUserId())
                .token(tokenDto.getRefreshToken())
                .build();

        refreshTokenRepository.save(refreshToken);

        return tokenDto;
    }

    @Transactional
    public void logout(String userEmail) {
        User user = userRepository.findByUserEmail(userEmail);
        refreshTokenRepository.deleteByUserKey(user.getUserId());
    }
    @Transactional
    public TokenDto oAuthLogin(String userEmail) throws SQLException {

        User user = userRepository.findByUserEmail(userEmail);


        // 유저 정보와 유저 권한이 담긴 token 생성. UserNamePasswordAuthentication Token 생성
        // String token = jwtTokenProvider.createToken(String.valueOf(user.getUserId()), user.getRoles());

        // AccessToken, RefreshToken 발급
        TokenDto tokenDto = jwtTokenProvider.createTokenDto(user.getUserId(),user.getRoles());

        RefreshToken refreshToken = RefreshToken.builder()
                .userKey(user.getUserId())
                .token(tokenDto.getRefreshToken())
                .build();

        refreshTokenRepository.save(refreshToken);

        return tokenDto;
    }

    @Transactional
    public UserDto userInfo (String userEmail){
        User user = userRepository.findByUserEmail(userEmail);

        Language language = user.getLanguageId();
        LanguageDto languageDto = LanguageDto.builder()
                .languageId(language.getLanguageId())
                .name(language.getLanguageName())
                .code(language.getLanguageCode()).build();

        List<UserInterest> userInterests = userInterestRepository.findAllByUserId(user);

        List<InterestDto> interests = new ArrayList<>();
        for(UserInterest userInterest : userInterests){
            InterestDto interestDto = InterestDto.builder()
                    .interestId(userInterest.getInterestId().getInterestId())
                    .field(userInterest.getInterestId().getField()).build();
            interests.add(interestDto);
        }

        UserDto userDto = UserDto.builder()
                .userEmail(user.getUserEmail())
                .name(user.getName())
                .birthDay(user.getBirthday())
                .language(languageDto)
                .interests(interests)
                .badUser(user.isBadUser())
                .imgUrl(user.getImgUrl())
                .userId(user.getUserId())
                .bio(user.getBio()).build();
        return userDto;
    }

    @Transactional
    public void signUp(UserDto userDto) {

        if(userRepository.findByUserEmail(userDto.getUserEmail())==null){
            User user = userRepository.save(userDto.toEntity());

            for(InterestDto interestDto : userDto.getInterests()){
                UserInterest userInterest = UserInterest.builder()
                                .userId(user).interestId(interestDto.toEntity()).build();

                userInterestRepository.save(userInterest);

            }
        }
    }

    @Transactional
    public User findByEmail(String userEmail) throws SQLException{
        return userRepository.findByUserEmail(userEmail);
    }

    @Transactional
    public User findById(Long userId) throws SQLException{
        return userRepository.findByUserId(userId);
    }

    @Transactional
    public TokenDto refreshToken(TokenRequestDto tokenRequestDto) throws SQLException {

        // 만료된 refresh token 에러
        if(!jwtTokenProvider.validateToken(tokenRequestDto.getRefreshToken())){
            System.out.println("토큰 에러");
            throw new TokenValidFailedException(); // refreshtoken 예외 처리로 바꿔주기
        }

        // AccessToken 에서 username(pk) 가져오기
        String accessToken = tokenRequestDto.getAccessToken();
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);

        // userPk로 유저 검섹
        //User user = userRepository.findByUserId(Long.parseLong(authentication.getName()));// usernotfound 예외 처리로 바꿔주기
        User user = userRepository.findByUserEmail(authentication.getName());
        if (user == null ) {
            throw new UserNotFoundException();
        }
        RefreshToken refreshToken = refreshTokenRepository.findByUserKey(user.getUserId());

        // 전달받은 refreshToken과 db의 refreshToken 비교
        if(!refreshToken.getToken().equals(tokenRequestDto.getRefreshToken()))
            throw new TokenValidFailedException();// refreshtoken 예외 처리로 바꿔주기

        // AccessToken, RefreshToken 재발급 및 RefreshToken 저장
        TokenDto newCreatedToken = jwtTokenProvider.createTokenDto(user.getUserId(), user.getRoles());
        RefreshToken updateRefreshToken  = refreshToken.updateToken(newCreatedToken.getRefreshToken());
        refreshTokenRepository.save(updateRefreshToken);

        return newCreatedToken;
    }

    public User dupName(String name){
        return userRepository.findByName(name);
    }

    @Transactional
    public void modifyUser(UserDto userDto, MultipartFile multipartFile) {

        // 맞는 유저 가져오기
        User user = userRepository.findByUserEmail(userDto.getUserEmail());

        try{
            if (multipartFile != null) {
                user.updateImgUrl(s3FileUploadService.upload(multipartFile));
            }
        }catch (IOException e) {
            e.printStackTrace();
        }

        user.update(userDto.getName(), userDto.getBirthDay(), userDto.getLanguage().toEntity(), userDto.getBio());

        userInterestRepository.deleteAllByUserId(user);

        for(InterestDto interestDto : userDto.getInterests()){
            UserInterest userInterest = UserInterest.builder()
                    .userId(user).interestId(interestDto.toEntity()).build();
            userInterestRepository.save(userInterest);
        }

    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile(String userEmail){

        User user = userRepository.findByUserEmail(userEmail);

        Language language = user.getLanguageId();
        LanguageDto languageDto = LanguageDto.builder()
                .languageId(language.getLanguageId())
                .code(language.getLanguageCode())
                .name(language.getLanguageName()).build();

        List<UserInterest> userInterests = userInterestRepository.findAllByUserId(user);

        List<InterestDto> interests = new ArrayList<>();
        for(UserInterest userInterest : userInterests){
            InterestDto interestDto = InterestDto.builder()
                    .interestId(userInterest.getInterestId().getInterestId())
                    .field(userInterest.getInterestId().getField()).build();
            interests.add(interestDto);
        }

        return ProfileDto.builder()
                .userEmail(user.getUserEmail())
                .name(user.getName())
                .birthDay(user.getBirthday())
                .language(languageDto)
                .interests(interests)
                .imgUrl(user.getImgUrl())
                .bio(user.getBio()).build();
    }

    @Transactional(readOnly = true)
    public List<InterestDto> getInterest(){
        List<Interest> interests = interestRepository.findAll();

        List<InterestDto> interestDtos = new ArrayList<>();

        for(Interest interest : interests){
            interestDtos.add(InterestDto.builder().interestId(interest.getInterestId()).field(interest.getField()).build());
        }

        return interestDtos;
    }

    @Transactional(readOnly = true)
    public List<LanguageDto> getLanguage(){
        List<Language> languages = languageRepository.findAll();

        List<LanguageDto> languageDtos = new ArrayList<>();

        for(Language language : languages){
            languageDtos.add(LanguageDto.builder().languageId(language.getLanguageId()).name(language.getLanguageName()).code(language.getLanguageCode()).build());
        }

        return languageDtos;
    }
    @Transactional
    public void modifyPwd (PwdDto pwdDto) {
        User user = userRepository.findByUserEmail(pwdDto.getUserEmail());

        System.out.println(pwdDto.getNewPassword());
        user.update(pwdDto.getNewPassword());

    }

//    @Transactional
//    public User findBySocialTypeAndSocialId(String socialType, String socialId){
//        return userRepository.findBySocialTypeAndSocialId(socialType,socialId).orElse(null);
//    }

}
