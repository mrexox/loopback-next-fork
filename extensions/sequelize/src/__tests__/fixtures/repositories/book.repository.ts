import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Book, BookRelations, Category} from '../models/index';
import {CategoryRepository} from './category.repository';

export class BookRepository extends SequelizeCrudRepository<
  Book,
  typeof Book.prototype.id,
  BookRelations
> {
  public readonly category: BelongsToAccessor<
    Category,
    typeof Book.prototype.id
  >;

  constructor(
    @inject('datasources.primary') dataSource: PrimaryDataSource,
    @repository.getter('CategoryRepository')
    protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Book, dataSource);
    this.category = this.createBelongsToAccessorFor(
      'category',
      categoryRepositoryGetter,
    );
    this.registerInclusionResolver('category', this.category.inclusionResolver);
  }
}
