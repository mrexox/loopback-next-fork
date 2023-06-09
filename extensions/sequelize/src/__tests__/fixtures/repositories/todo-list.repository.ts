import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Todo, TodoList, TodoListRelations} from '../models/index';
import {TodoRepository} from './todo.repository';

export class TodoListRepository extends SequelizeCrudRepository<
  TodoList,
  typeof TodoList.prototype.id,
  TodoListRelations
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;

  constructor(
    @inject('datasources.primary') dataSource: PrimaryDataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
    this.registerInclusionResolver('todos', this.todos.inclusionResolver);
  }
}
