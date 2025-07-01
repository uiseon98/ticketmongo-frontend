import { Mail, User, Phone, MapPin, UserPlus } from 'lucide-react';

export const profileInputType = [
  {
    name: 'email',
    type: 'email',
    icon: Mail,
    labelName: '이메일',
    disable: true,
  },
  {
    name: 'username',
    type: 'text',
    icon: User,
    labelName: '아이디',
    disable: true,
  },
  {
    name: 'name',
    type: 'text',
    icon: User,
    labelName: '이름',
  },
  {
    name: 'nickname',
    type: 'text',
    icon: UserPlus,
    labelName: '닉네임',
  },
  {
    name: 'phone',
    type: 'tel',
    icon: Phone,
    labelName: '전화번호',
  },
  {
    name: 'address',
    type: 'text',
    icon: MapPin,
    labelName: '주소',
  },
];
