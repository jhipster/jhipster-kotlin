const sqllight = ['BankAccount', 'Label', 'Operation'];

const document = [
    'DocumentBankAccount',
    'EmbeddedOperation',
    'Place',
    'Division',

    'FieldTestEntity',
    'FieldTestMapstructAndServiceClassEntity',
    'FieldTestServiceClassAndJpaFilteringEntity',
    'FieldTestServiceImplEntity',
    'FieldTestInfiniteScrollEntity',
    'FieldTestPaginationEntity',

    'EntityWithDTO',
    'EntityWithPaginationAndDTO',
    'EntityWithServiceClassAndPagination',
    'EntityWithServiceClassPaginationAndDTO',
    'EntityWithServiceImplAndDTO',
    'EntityWithServiceImplAndPagination',
    'EntityWithServiceImplPaginationAndDTO',
];

const sql = [
    ...sqllight,

    'FieldTestEntity',
    'FieldTestMapstructAndServiceClassEntity',
    'FieldTestServiceClassAndJpaFilteringEntity',
    'FieldTestServiceImplEntity',
    'FieldTestInfiniteScrollEntity',
    'FieldTestPaginationEntity',
    'FieldTestEnumWithValue',

    'EntityWithDTO',
    'EntityWithPaginationAndDTO',
    'EntityWithServiceClassAndPagination',
    'EntityWithServiceClassPaginationAndDTO',
    'EntityWithServiceImplAndDTO',
    'EntityWithServiceImplAndPagination',
    'EntityWithServiceImplPaginationAndDTO',

    'MapsIdUserProfileWithDTO',
];

export const entitiesByType = {
    document,
    mongodb: document,
    couchbase: document,
    neo4j: ['Album', 'Track', 'Genre', 'Artist'],
    cassandra: [
        'CassBankAccount',

        'FieldTestEntity',
        'FieldTestServiceImplEntity',
        'FieldTestMapstructAndServiceClassEntity',
        'FieldTestPaginationEntity',
    ],
    micro: [
        'MicroserviceBankAccount',
        'MicroserviceOperation',
        'MicroserviceLabel',

        'FieldTestEntity',
        'FieldTestMapstructAndServiceClassEntity',
        'FieldTestServiceClassAndJpaFilteringEntity',
        'FieldTestServiceImplEntity',
        'FieldTestInfiniteScrollEntity',
        'FieldTestPaginationEntity',
    ],
    sqllight,
    sql,
    sqlfull: [
        ...sql,
        'Place',
        'Division',

        'TestEntity',
        'TestMapstruct',
        'TestServiceClass',
        'TestServiceImpl',
        'TestInfiniteScroll',
        'TestPagination',
        'TestManyToOne',
        'TestManyToMany',
        'TestManyRelPaginDTO',
        'TestOneToOne',
        'TestCustomTableName',
        'TestTwoRelationshipsSameEntity',
        'SuperMegaLargeTestEntity',

        'MapsIdParentEntityWithoutDTO',
        'MapsIdChildEntityWithoutDTO',
        'MapsIdGrandchildEntityWithoutDTO',
        'MapsIdParentEntityWithDTO',
        'MapsIdChildEntityWithDTO',
        'MapsIdGrandchildEntityWithDTO',

        'JpaFilteringRelationship',
        'JpaFilteringOtherSide',
    ],
};
