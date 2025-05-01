import { Injectable } from "@nestjs/common";
import { ProductEntity } from "../entities/product.entity";
import { ProductBasicRawDto } from "../dto/response/product-basic-raw.dto";
import { ProductDetailRawDto } from "../dto/response/product-detail-raw.dto";
import { ProductSearchRepository } from "../repositories/product-search.repository";
import { FindEntityArgs, Searcher } from "../../../common/interfaces/search/searcher";
import { Implemented } from "../../../common/decorators/implemented.decoration";
import { FindAllProductsDto } from "../dto/request/find-all-products.dto";
import { SearchProductsDto } from "../dto/request/search-product.dto";
import hangul from "hangul-js";

@Injectable()
export class ProductSearcher implements Searcher<ProductEntity, FindAllProductsDto, ProductBasicRawDto> {
  constructor(private readonly productSearchRepository: ProductSearchRepository) {}

  @Implemented
  public findEntity(args: FindEntityArgs): Promise<ProductEntity | ProductEntity[]> {
    const { property, alias, getOne, entities } = args;
    if (entities && entities.length) {
      return this.productSearchRepository.findOptionalEntity({ property, alias, entities, getOne });
    }
    return this.productSearchRepository.findPureEntity({ property, alias, getOne });
  }

  @Implemented
  public findAllRaws(dto: FindAllProductsDto): Promise<ProductBasicRawDto[]> {
    return this.productSearchRepository.findAllRaws(dto);
  }

  public findDetailRaw(id: string): Promise<ProductDetailRawDto> {
    return this.productSearchRepository.findDetailRaw(id);
  }

  public async findProductAutocomplete(search: string): Promise<string[]> {
    const autocompleteDto = await this.productSearchRepository.findProductAutocomplete(search);

    if (autocompleteDto.isChoseongKeyword) {
      autocompleteDto.productNames = autocompleteDto.productNames.filter((productName) =>
        hangul
          .disassemble(productName, true)
          .map((arr) => arr[0])
          .join("")
          .includes(search),
      );
      const result = autocompleteDto.productNames.sort((a, b) => {
        const [[aFirstChoseong]] = hangul.disassemble([...a][0], true);
        const [[bFirstChoseong]] = hangul.disassemble([...b][0], true);
        const aStartsWith = aFirstChoseong.startsWith(search) ? 0 : 1;
        const bStartsWith = bFirstChoseong.startsWith(search) ? 0 : 1;

        if (aStartsWith !== bStartsWith) {
          return aStartsWith - bStartsWith;
        }

        // 2차 정렬: 가나다 순 (localeCompare)
        return a.localeCompare(b, "ko");
      });

      return result;
    } else {
      return autocompleteDto.productNames.sort((a, b) => {
        const aStartsWith = a.startsWith(search) ? 0 : 1;
        const bStartsWith = b.startsWith(search) ? 0 : 1;
        return aStartsWith - bStartsWith;
      });
    }
  }

  public async searchProduct(dto: SearchProductsDto): Promise<ProductBasicRawDto[]> {
    return this.productSearchRepository.searchProduct(dto);
  }
}
