import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

export const registerUser = async data => {
  try {
    const response = await apiClient.post('/auth/register', data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.message || '회원가입 중 오류가 발생했습니다.',
    };
  }
};
