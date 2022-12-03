import { StyleSheet, StatusBar } from "react-native";

export const styles = StyleSheet.create({
  container: {
    height: '100%',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
  fieldName: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 22,
  },
  pageDirection: {
    marginTop: 30,
    margin: 10,
    fontSize: 34,
    alignSelf: 'flex-start',
  },
  fieldInput: {
    width: 200,
    fontSize: 30,
  },
  switch: {
    justifyContent: 'flex-end',
    padding: 5,
    fontSize: 30,
  },
  row: {
    marginLeft: 10,
    marginTop: 5,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  wrapper: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnSubmit: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#A3CDFF',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
  },
  btnCancel: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FF6464',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
  },
  btnText: {
    fontSize: 22,
  },
  inputIOS: {
    fontSize: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'red',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  scrollView: {
    marginHorizontal: 10,
  },
  flatList: {
    marginTop: 10,
    height: '75%',
    flexGrow: 0,
    padding: 5,
  },
  btnOfflineQueue: {
    alignSelf: 'flex-end',
    justifyContent: 'start',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#A3CDFF',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
  },
  searchBar: {
    margin: 5,
    fontSize: 30,
    width: 200,
    padding: 1,
    alignSelf: 'center',
  }
});