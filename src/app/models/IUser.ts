interface Sponsor {
  img: string;
  url: string;
}
export interface IUser {
  name: string;
  last_name: string;
  email: string;
  role: string;
  photo: string;
  photoBanner: string;
  slider: string[];
  estado: string;
  phone: string;
  birth_date: Date;
  username: string;
  profile_user: string;
  parents_email: string;
  parents_last_name: string;
  parents_name: string;
  sport: string;
  sub_profile: string;
  _id: string;
  attempts: number;
  create: Date;
  deleted: boolean;
  recover_password_token: string;
  verification_token: string;
  verified: boolean;
  lastConection: Date;
  connected: boolean;
  sponsors: Sponsor[];
  structure: any;
  geo:any;
}
