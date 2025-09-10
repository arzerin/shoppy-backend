import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/token-payload.interface';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  
//   @Get()
//   @UseGuards(JwtAuthGuard)
//   getMe(@CurrentUser() user: TokenPayload) {
//       console.log('Backend Payload, Get Product Controller', user);
//       return user;
//   }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user?: TokenPayload,
  ) {
    
    console.log('Backend Payload, POST Product Controller', user);
    
    
    const userId = user?.userId ?? 0; // or make userId optional in your service
    console.log("Payload Data", user) ;
    console.log("IN post body", body) ;
    //return body;
    return this.productsService.createProduct(body, 1);
  }
}
