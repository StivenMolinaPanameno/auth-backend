import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcryptjs from 'bcryptjs'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(@InjectModel(User.name) 
              private userModel:Model<User>,
              private jwtService: JwtService
              
              ){}


  async create(createUserDto: CreateUserDto):Promise<User> {
    

    try {

      const {password, ...userData} = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });
      await newUser.save();
      const {password:_, ...user} = newUser.toJSON();
      return user;
      
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`${createUserDto.email} already exists`);
      }
      throw new BadRequestException('Something terrible happen!!!');
    }
  }



  async register(registerUser:RegisterUserDto):Promise<LoginResponse>{
    const createUserDto: CreateUserDto = {
      // Mapear los atributos de registerUser a createUserDto
        email: registerUser.email,
        password: registerUser.password,
        name: registerUser.name,   
     };
    const saveUser = await this.create(createUserDto);   
    const {password:_, ...rest} = saveUser;
    return {
      user: rest,
      token: this.getJwToken({id: saveUser._id})
    }
    
  }
  


  async login(loginDto:LoginDto):Promise<LoginResponse>{
    const {email, password} = loginDto;
    const user = await this.userModel.findOne({email:email})

    if(!user) throw new UnauthorizedException('Not Valid credentials');
   

    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials')
    }

    const {password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: this.getJwToken({id: user.id}),
    }
  }


  async findUserById(id:string){
    const user = await this.userModel.findById(id);
    const{password, ...rest} = user.toJSON();
    return rest;

  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  
  getJwToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
  

  
  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
  
  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

}
