import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import JobsScreen from "../screens/JobsScreen";
import AIAssistantScreen from "../screens/AIAssistantScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: () => "🏠",
        }}
      />

      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          title: "Jobs",
          tabBarIcon: () => "💼",
        }}
      />

      <Tab.Screen
        name="AI"
        component={AIAssistantScreen}
        options={{
          title: "AI Assistant",
          tabBarIcon: () => "✨",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: () => "👤",
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{
            headerShown: false,
          }}
        />

      <Stack.Screen
  name="JobDetails"
  component={JobDetailsScreen}
  options={{
    title: "Job Details",
  }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}