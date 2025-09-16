import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';


import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { CreateProductRequest } from './dto/create-product.request';
import { TokenPayload } from '../auth/token-payload.interface';
import { ProductsService } from './products.service';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { PRODUCT_IMAGES } from './product-images';

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
    @CurrentUser() user: TokenPayload
  ) {
    
    console.log('Backend Payload, POST Product Controller Data:', user);

    const userId = user?.userId ?? 0; // or make userId optional in your service
    console.log("Payload Data", user) ;
    console.log("IN post body", body) ;
    //return body;
    return this.productsService.createProduct(body, 1);
  }

  @Post(':productId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: PRODUCT_IMAGES, //'public/products',
        filename: (req, file, callback) => {
          callback(
            null,
            `${req.params.productId}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    _file: Express.Multer.File,
  ) {}

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // async getProducts() {
  //   return this.productsService.getProducts();
  // }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProducts(@Query('status') status?: string) {
    return this.productsService.getProducts(status);
  }
  @Get(':productId')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Param('productId') productId: string) {
    return this.productsService.getProduct(+productId);
  }
}
