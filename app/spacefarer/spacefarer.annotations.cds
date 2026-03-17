using {GalacticSpacefarerService} from '../../srv/spacefarer/spacefarer.service';

annotate GalacticSpacefarerService.Spacefarers with {
  name                       @title: 'Name'                       @mandatory  @Core.Immutable: true;
  origin_planet              @title: 'Origin Planet'              @mandatory  @Core.Immutable: true;
  wormhole_navigation_skill  @title: 'Wormhole Navigation Skill'  @mandatory  @Core.Immutable: true;
  stardust_collection        @title: 'Stardust Collection'        @mandatory;
  spacesuit_color            @title: 'Spacesuit Color';
};

annotate GalacticSpacefarerService.Spacefarers with {
  department @(
    title : 'Department',
    Common: {
      Text           : department.name,
      TextArrangement: #TextOnly,
      ValueList      : {
        CollectionPath: 'Departments',
        Parameters    : [
          {
            $Type            : 'Common.ValueListParameterOut',
            LocalDataProperty: department_ID,
            ValueListProperty: 'ID'
          },
          {
            $Type            : 'Common.ValueListParameterDisplayOnly',
            ValueListProperty: 'name'
          }
        ]
      }
    }
  );

  position   @(
    title : 'Position',
    Common: {
      Text           : position.title,
      TextArrangement: #TextOnly,
      ValueList      : {
        CollectionPath: 'Positions',
        Parameters    : [
          {
            $Type            : 'Common.ValueListParameterOut',
            LocalDataProperty: position_ID,
            ValueListProperty: 'ID'
          },
          {
            $Type            : 'Common.ValueListParameterDisplayOnly',
            ValueListProperty: 'title'
          },
          {
            $Type            : 'Common.ValueListParameterDisplayOnly',
            ValueListProperty: 'rank'
          }
        ]
      }
    }
  );
};


annotate GalacticSpacefarerService.Spacefarers with @(
  UI.LineItem           : [
    {
      $Type: 'UI.DataField',
      Value: name,
      Label: 'Name'
    },
    {
      $Type: 'UI.DataField',
      Value: stardust_collection,
      Label: 'Stardust Collection'
    },
    {
      $Type: 'UI.DataField',
      Value: spacesuit_color,
      Label: 'Spacesuit Color'
    }
  ],

  UI.SelectionFields    : [
    origin_planet,
    spacesuit_color
  ],

  UI.PresentationVariant: {
    MaxItems      : 8,
    SortOrder     : [{
      $Type     : 'Common.SortOrderType',
      Property  : stardust_collection,
      Descending: true
    }],
    Visualizations: ['@UI.LineItem']
  },

  //Cosmic Object Page
  UI.HeaderInfo         : {
    TypeName      : 'Spacefarer',
    TypeNamePlural: 'Spacefarers',
    Title         : {Value: name},
    Description   : {Value: origin_planet}
  },

  UI.FieldGroup #Details: {
    Label: 'Cosmic Details',
    Data : [
      {
        $Type: 'UI.DataField',
        Value: name,
        Label: 'Name'
      },
      {
        $Type: 'UI.DataField',
        Value: origin_planet,
        Label: 'Origin Planet'
      },
      {
        $Type: 'UI.DataField',
        Value: stardust_collection,
        Label: 'Stardust Collection'
      },
      {
        $Type: 'UI.DataField',
        Value: spacesuit_color,
        Label: 'Spacesuit Color'
      },
      {
        $Type: 'UI.DataField',
        Value: department.name,
        Label: 'Department'
      },
      {
        $Type: 'UI.DataField',
        Value: position.title,
        Label: 'Position'
      },
      {
        $Type: 'UI.DataField',
        Value: position.rank,
        Label: 'Rank'
      },

    ]
  },

  UI.Facets             : [{
    $Type : 'UI.ReferenceFacet',
    Label : 'Cosmic Details',
    Target: '@UI.FieldGroup#Details'
  }]

);
