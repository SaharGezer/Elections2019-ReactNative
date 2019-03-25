import React from 'react';
import {Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator , Alert, Button, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';

class HomeScreen extends React.Component {

  constructor(props){
    super(props);
    this.state ={ 
      isLoading: true,
      isFirst:true
    }
  }

  partiesList(){
    return this.state.dataSource.map(item => (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          fetch(`https://isr-elections.herokuapp.com/api/parties/vote/${item.id}`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          })
            .then(response => {
              if (response.status === 200) {
                Alert.alert(
                  'Great Job',
                  'You Vote to ' + item.id,
                  [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                  ],
                  {cancelable: false},
                );
              }
            })

            .catch(err => {
              console.log(err)
            })
        }}
      >
        <View style={styles.logoContainer}>
          <Image source={partiesLogos[item.id]} />
        </View>
      </TouchableOpacity>
    ))
  }

  componentDidMount(){
    return fetch('https://isr-elections.herokuapp.com/api/parties')
    .then((response) => response.json())
    .then((responseJson) => {
      
      this.setState({
        isLoading: false,
        dataSource: responseJson.parties,
      })
    })
    .catch((error) =>{
      console.error(error);
    });
  }
  
  render(){
    if (this.state.isFirst){
      Alert.alert(
        'Israeli Election 2019',
        'Please Vote To Your Party',
        [
          {text: 'Start', onPress: () => this.setState(
              {isFirst:false}
          )},
        ],
        {cancelable: false},
      );
    }

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    
    return(
        <View>
          <Image source={partiesLogos['ele']} style={styles.mainLogo}/>
        <ScrollView>
          <View style={styles.container}>
            {this.partiesList()}
          </View>
        </ScrollView>
        </View>
    );
  }
}

class TopFiveScreen extends React.Component {
    constructor(props){
    super(props);
    this.totalVotes = 0

    this.state ={ 
      isLoading: true,
    }
    this.viewPar = this.viewPar.bind(this)
  }
  
   componentDidMount(){
    return fetch('https://isr-elections.herokuapp.com/api/parties')
    .then((response) => response.json())
    .then((responseJson) => {
      
      this.setState({
        isLoading: false,
        dataSource: responseJson.parties,
      })
    })
    .then(() => this.getVotes())
    .catch((error) =>{
      console.error(error);
    });
  }

  getVotes(){
    return fetch('https://isr-elections.herokuapp.com/api/parties/poll-status')
    .then(response => response.json())
    .then(responseJson => {
        this.setState({
          votes: responseJson
        })
    })
    .catch(error => {
      console.error(error)
    })
  }

  sortAndPrint(){
    let i 
    const ranking = []
    let result =[]
    let total = 0
    let votes = this.state.votes
    for (i in votes) {
      this.totalVotes += votes[i].currentVotes
      ranking.push([i, votes[i].currentVotes])
    }
    ranking.sort(function(a, b){return b[1]-a[1]})

    return ranking.map(this.viewPar).slice(0,6)
  }

  viewPar(party, i) {
    const party_name = party[0]
    const percent = (party[1] / this.totalVotes) * 100
    return (<View key={ `party${i}`} style={styles.logoContainer}>
              <Image source={partiesLogos[party_name]} />
              <View style= {{ top:5 ,alignItems:'center'}}>
                <Text style={{fontSize:25,fontWeight: 'bold'}} >{`${Math.round(percent * 100)/100}%`}</Text>
              </View>
            </View>
            )
  }

  
  render(){
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return(
        <View>
          <Image source={require('./images/result.jpg')} style={styles.mainLogo}/>
        <ScrollView>
          <View style={styles.container}>
            {this.sortAndPrint()}
          </View>
        </ScrollView>
        </View>
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Home:{ 
    screen:HomeScreen,
      navigationOptions: {
        tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => (
        <Ionicons name="md-home" size={20} color='blue'/>
      )
      },
    },
  TopFive:{ 
    screen:TopFiveScreen,
    navigationOptions: {
        tabBarLabel:"Top 5",
        tabBarIcon: ({ tintColor }) => (
        <Ionicons name="md-trophy" size={20} color='blue'/>
      )
      },
    }
});

export default createAppContainer(TabNavigator);

const partiesLogos = {
  'likud': require('./images/likud.jpg'),
  'avoda': require('./images/avoda.jpg'),
  'kahol-lavan': require('./images/kahol-lavan.png'),
  'merez': require('./images/merez.jpg'),
  'kulanu': require('./images/kulanu.jpg'),
  'yamin-hadash': require('./images/yamin-hadash.jpg'),
  'israel-beitenu': require('./images/israel-beitenu.jpg'),
  'shas': require('./images/shas.jpg'),
  'yahadut-hatora': require('./images/yahadut-hatora.jpg'),
  'raam-taal': require('./images/raam-taal.jpg'),
  'balad': require('./images/balad.jpg'),
  'zehut': require('./images/zehut.jpg'),
  'gesher': require('./images/gesher.jpg'),
  'magen': require('./images/magen.jpg'),
  'ihud-miflagot-hayamin': require('./images/ihud-miflagot-hayamin.png'),
  'ele': require('./images/elections2019.jpg')
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c86b7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer:{
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#fff',
    borderStyle:'solid',
    width: 280,
    height: 180,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  mainLogo:{
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 400,
    height: 200
  }
});

