using {GalacticSpacefarerService} from '../../srv/spacefarer/spacefarer.service';

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
      }
    ]
  },

  UI.Facets             : [{
    $Type : 'UI.ReferenceFacet',
    Label : 'Cosmic Details',
    Target: '@UI.FieldGroup#Details'
  }]

);
