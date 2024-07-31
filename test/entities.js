export const entityWithCriteriaAndDto = {
    name: 'CriteriaAndDto',
    changelogDate: '20220129001000',
    jpaMetamodelFiltering: true,
    dto: 'mapstruct',
    service: 'serviceImpl',
    fields: [{ fieldName: 'criteriaName', fieldType: 'String', fieldValidateRules: ['required'] }],
};

export const entityWithEnum = {
    name: 'EntityWithEnum',
    changelogDate: '20220129001100',
    fields: [{ fieldName: 'enumTom', fieldType: 'EnumFieldClass', fieldValues: 'ENUM_VALUE_1,ENUM_VALUE_2,ENUM_VALUE_3' }],
};

export const entityWithBagRelationship = {
    name: 'RelationshipWithBagRelationship',
    changelogDate: '20220129001200',
    fields: [{ fieldName: 'twoName', fieldType: 'String' }],
    relationships: [
        {
            relationshipName: 'relationship',
            otherEntityName: 'Simple',
            relationshipType: 'many-to-many',
            relationshipValidateRules: ['required'],
        },
    ],
};
